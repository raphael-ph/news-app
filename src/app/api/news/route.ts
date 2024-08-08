import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const sessionToken = process.env.SESSION_TOKEN;

if (!accessKeyId || !secretAccessKey || !sessionToken) {
  throw new Error('AWS credentials are not set properly in environment variables.');
}

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId,
    secretAccessKey,
    sessionToken,
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

    if (startDate) {
      filterExpressions.push("#date_publish >= :startDate");
      expressionAttributeValues[":startDate"] = startDate;
      expressionAttributeNames["#date_publish"] = "date_publish";
    }

    if (endDate) {
      filterExpressions.push("#date_publish <= :endDate");
      expressionAttributeValues[":endDate"] = endDate;
      expressionAttributeNames["#date_publish"] = "date_publish";
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(" AND ");
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    console.log('DynamoDB Scan params:', params);

    const data = await ddbDocClient.send(new ScanCommand(params));
    let items = data.Items || [];

    // Sort by relevance (ascending) and date_publish (descending)
    items.sort((a, b) => {
      const relevanceDiff = parseInt(a.relevance || '0', 10) - parseInt(b.relevance || '0', 10);
      if (relevanceDiff !== 0) return relevanceDiff;
      return new Date(b.date_publish).getTime() - new Date(a.date_publish).getTime();
    });

    // Apply the limit
    const limitedItems = limit > 0 ? items.slice(0, limit) : items;

    console.log('Filtered items:', limitedItems);

    return NextResponse.json(limitedItems);
  } catch (error) {
    // TypeScript requires you to assert the error type
    if (error instanceof Error) {
      console.error('Error fetching filtered news:', error.message);
      return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    } else {
      console.error('Unexpected error:', error);
      return NextResponse.json({ message: 'Internal Server Error', error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}
