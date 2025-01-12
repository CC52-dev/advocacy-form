import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const db = drizzle(process.env.DATABASE_URL!);