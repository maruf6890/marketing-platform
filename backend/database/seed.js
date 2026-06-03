import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import "dotenv/config";

console.log("Starting seeding...");

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true,
});

const seedingDir = path.join(process.cwd(), "database", "seed");

const files = fs.readdirSync(seedingDir).sort();
for (const file of files) {
  const sql = fs.readFileSync(path.join(seedingDir, file), "utf8");
  console.log(`Running: ${file}`);
  await connection.query(sql);
}

console.log("Seeding complete");
await connection.end();
