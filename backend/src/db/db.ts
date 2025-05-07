import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { URL } from "url";



async function createConnection() {
  try {
    const connection = await mysql.createConnection({
   host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    });
    return drizzle(connection);
  } catch (error) {
    console.error("Failed to create database connection:", error);
    throw error;
  }
}

const db = await createConnection();

export default db;
