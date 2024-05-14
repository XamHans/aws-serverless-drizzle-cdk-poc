import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { initDrizzleContext } from '../lib/db/client';

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const db = await initDrizzleContext();
  const users = await db.query.users.findMany();

  return {
    statusCode: 200,
    body: JSON.stringify({ users: users }),
  };
};