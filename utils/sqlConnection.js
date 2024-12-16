import { createPool } from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function initDB() {
  console.log("Database initialized");
}

export default pool;
const _initDB = initDB;
export { _initDB as initDB };
