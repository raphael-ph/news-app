import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { format, parse, startOfDay, endOfDay, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: `ASIA2UC3E42NFLUCXUZ7`,
    secretAccessKey: `nLrvuSVyQHkm7SzIRzCn5YJYp6GPdUyy78aT5Gc2`,
    sessionToken: `IQoJb3JpZ2luX2VjEN3//////////wEaCWV1LXdlc3QtMiJHMEUCIGWaLvwy8KN7zOPbAinz8FrWx1paz3GB6MR1i8eBrP1HAiEA1BkMilTul/Dg0LgxIo6UB5TCNLOjMbRqg6PLhkogxcUq/wII1v//////////ARAAGgw3MzAzMzU2MDIzMzAiDG058HrS3bvS+lLPGSrTAi9RJnhMmpapkWnHC0KVb1LWvi7IrbhdAkr96o0o4mZRD71XApnVHrQSlfHuuh2wSPgKeztYyE+PFumIbQSedIuDBF3arkBxieFVSw9YJaONPRLqxl/tn7SDucJNgnVB258WPOO1HTP8s39cgMwq8ERoNcEBfKxFw0Tr8M+/F/9AeQ73kcgvHzUV2gQn4wjnc1zJ85Bo8Cu0g2KbfyCP5YHP6xtKVliUx8/pJjXJ2DJyqAvociRJv9xAbYz1Hh9jOszU0e6wsg+9dAiTCLap3HcQqY4uOa9EpibwoJBLZ7e/blXYRpHCbyCrZRmJbaclgjUtQ8X/hV8sIVO5jOdbfaiXilHUYSw9VPB1mk/RQSNM91E73EcejJzk6J/IMNFCpzhvmGNirpnaH4X5nOR9xlpjQQaZm5XDeu15O6X47k11BqnlqMFEqn86EITS6xcjrDs5STDz+Pe1BjqnAaLOvuWGOa9ZvLrtikVtFUh6FFwUrzpeX2cZxKkm7voATaW2TspzNWF84femN1CVWgAb3Gmbc6gKT4guZz0eGadsQjlVYkwn68Wr5UmMsv3CAs64fn2stmeXMtcFKXppmJtv4wVTfpsvqTIctH2aZZEaacwn3xZsXMr4n2F5dLQ0jpSlmNnRcF8Q/SQIej9Q0aA8TScrZZcvjGIiVeZsLoejzZLbbyHj`,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const relevance = searchParams.get('relevance') || '';
  const sentiment = searchParams.get('sentiment') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  // Function to format date to ISO format "yyyy-MM-dd'T'HH:mm:ss"
  function formatDateToDBFormat(date: string) {
    if (!date) return '';
    try {
      // Attempt to parse different possible date formats
      const formats = [
        'dd-MM-yyyy HH:mm:ss',
        'dd/MM/yyyy HH:mm:ss',
        'yyyy-MM-dd HH:mm:ss',
        'MM/dd/yyyy HH:mm:ss',
      ];

      for (const fmt of formats) {
        const dt = parse(date, fmt, new Date(), { locale: ptBR });
        if (isValid(dt)) {
          return format(dt, "yyyy-MM-dd HH:mm:ss");
        }
      }

      console.error('Invalid date format:', date);
      return '';
    } catch (e) {
      console.error('Date parsing error:', e);
      return '';
    }
  }

  const startDateFormatted = formatDateToDBFormat(startDate);
  const endDateFormatted = formatDateToDBFormat(endDate);

  console.log('Start Date Formatted:', startDateFormatted);
  console.log('End Date Formatted:', endDateFormatted);

  try {
    const params: any = {
      TableName: "news",
    };

    const filterExpressions: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    if (relevance && relevance !== 'ALL') {
      filterExpressions.push("#relevance = :relevance");
      expressionAttributeValues[":relevance"] = relevance;
      expressionAttributeNames["#relevance"] = "relevance";
    }

    if (sentiment && sentiment !== 'ALL') {
      filterExpressions.push("#sentiment = :sentiment");
      expressionAttributeValues[":sentiment"] = sentiment;
      expressionAttributeNames["#sentiment"] = "sentiment";
    }

    if (startDateFormatted) {
      filterExpressions.push("#date_publish >= :startDate");
      expressionAttributeValues[":startDate"] = format(startOfDay(new Date(startDateFormatted)), "yyyy-MM-dd' 'HH:mm:ss");
      expressionAttributeNames["#date_publish"] = "date_publish";
    }

    if (endDateFormatted) {
      filterExpressions.push("#date_publish <= :endDate");
      expressionAttributeValues[":endDate"] = format(endOfDay(new Date(endDateFormatted)), "yyyy-MM-dd' 'HH:mm:ss");
      expressionAttributeNames["#date_publish"] = "date_publish";
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" AND ");
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    console.log('Filter Expression:', params.FilterExpression);
    console.log('Expression Attribute Names:', params.ExpressionAttributeNames);
    console.log('Expression Attribute Values:', params.ExpressionAttributeValues);

    const data = await ddbDocClient.send(new ScanCommand(params));
    let items = data.Items || [];

    // Sort items by date_publish in descending order
    items.sort((a, b) => {
      const dateA = new Date(a.date_publish || 0);
      const dateB = new Date(b.date_publish || 0);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

    // Apply additional filtering based on date range inclusively
    items = items.filter(item => {
      const itemDate = new Date(item.date_publish || 0);
      return (
        (!startDateFormatted || itemDate >= new Date(format(startOfDay(new Date(startDateFormatted)), "yyyy-MM-dd' 'HH:mm:ss"))) &&
        (!endDateFormatted || itemDate <= new Date(format(endOfDay(new Date(endDateFormatted)), "yyyy-MM-dd' 'HH:mm:ss")))
      );
    });

    const limitedItems = limit > 0 ? items.slice(0, limit) : items;

    return NextResponse.json(limitedItems);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching filtered news:', error.message);
      return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ message: 'Internal Server Error', error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}