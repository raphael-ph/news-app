import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { format, parse, startOfDay, endOfDay, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    sessionToken: process.env.SESSION_TOKEN,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const relevance = searchParams.get('relevance') || '';
  const sentiment = searchParams.get('sentiment') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

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

    let items: any[] = [];
    let lastEvaluatedKey: any = undefined;

    do {
      const scanParams: any = { ...params };
      if (lastEvaluatedKey) {
        scanParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      const data = await ddbDocClient.send(new ScanCommand(scanParams));
      items = items.concat(data.Items || []);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } while (lastEvaluatedKey);

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
