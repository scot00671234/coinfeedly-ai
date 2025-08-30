import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use DATABASE_URL or throw error in production
const databaseUrl = process.env.DATABASE_URL || (process.env.NODE_ENV === 'production' 
  ? null 
  : "postgresql://runner@localhost/commoditydb?host=/tmp&port=5433");

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required in production");
}

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using default development database");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
});

// Add error handling for pool
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully');
    if (client) release();
  }
});

export const db = drizzle(pool, { schema });