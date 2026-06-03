import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import "dotenv/config";

console.log("Starting migration...");

// DB connection
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true, // allow executing multiple SQL statements in one query
});

// migrations folder 
const migrationsDir = path.join(process.cwd(), "database", "migrations");

const files = fs.readdirSync(migrationsDir).sort();

for (const file of files) {
  // check if already executed
  const [rows] = await connection.query(
    "SELECT name FROM migrations WHERE name = ?",
    [file],
  );

  if (rows.length > 0) {
    console.log(`Skipping: ${file}`);
    continue;
  }

  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

  console.log(`Running: ${file}`);

  // FIX: split multiple SQL statements
  // const statements = sql
  //   .split(";")
  //   .map((s) => s.trim())
  //   .filter((s) => s.length > 0);

  // for (const stmt of statements) {
  //   await connection.query(stmt);
  // }
  await connection.query(sql);

  // mark migration as done
  await connection.query("INSERT INTO migrations (name) VALUES (?)", [file]);
}

console.log("Migration complete");
await connection.end();
