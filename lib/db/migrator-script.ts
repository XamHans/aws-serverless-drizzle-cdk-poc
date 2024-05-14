import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';


import { fetchDBSecret } from './client';
import * as schema from './schema';
import postgres = require('postgres');
import path = require('path');

async function initConnection() {
  const connectionUrl = await fetchDBSecret();
  const connection = await postgres(connectionUrl);
  return connection;
}

async function runMigration() {
  const connection = await initConnection();
  const db = drizzle(connection, { schema });

  const res = await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  await connection.end();
}

runMigration().catch(console.error);
