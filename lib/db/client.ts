import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import * as dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

dotenv.config();

export const initDrizzleContext = async () => {

    //0 connection String? But How? need to define another function that is caring of fetching credentials and builing up the connection String
    const connectionString = await fetchDBSecret();
    //1 create client
    const client = new Client({connectionString})

    await client.connect();

    const db = drizzle(client, {
        schema
    })

    return db;
}

export async function fetchDBSecret(): Promise<string> {
if (process.env.DB_CONNECTION_URL) {
    return process.env.DB_CONNECTION_URL as string;
  }

  const client = new SecretsManagerClient({
    region: 'eu-west-1',
  });

  let response;
  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: process.env.POSTGRES_DB_SECRET ?? 'connectionUrl',
        VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    console.log('ERROR fetching secret', error);
  }
  if (!response) throw new Error('Failed to fetch connection_url secret.');
  if (!response?.SecretString) throw new Error('SecretString not found in connection_url secret.');

  const secret = await JSON.parse(response.SecretString);
  const { password, host, port, username } = secret;
  const connectionString = `postgresql://${username}:${password}@${host}:${port}/postgres`;
  // can we set env with connection string so that we dont need to call it again and again?
  process.env.DB_CONNECTION_URL = connectionString;
  console.log('process env ', process.env)
  return connectionString;
}