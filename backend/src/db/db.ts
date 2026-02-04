import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { URL } from "url";



async function createPool() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 3, // Keep very low to stay under MySQL user connection limit
      maxIdle: 3, // Maximum idle connections (should match connectionLimit)
      idleTimeout: 60000, // Close idle connections after 60 seconds
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
    
    // Log pool status for debugging
    console.log('Database connection pool created with limit: 3 (low to avoid max_user_connections)');
    
    // Handle pool errors
    pool.on('connection', (connection) => {
      console.log('New database connection established');
    });
    
    return drizzle(pool);
  } catch (error) {
    console.error("Failed to create database pool:", error);
    throw error;
  }
}

const db = await createPool();

export default db;
