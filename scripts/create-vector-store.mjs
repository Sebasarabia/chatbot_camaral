import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envPathLocal = path.resolve(".env.local");
const envPath = path.resolve(".env");
if (fs.existsSync(envPathLocal)) {
  dotenv.config({ path: envPathLocal });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is required");
  process.exit(1);
}

const client = new OpenAI({ apiKey });

const name = `camaral-kb-${new Date().toISOString().replace(/[:.]/g, "-")}`;

try {
  const store = await client.beta.vectorStores.create({ name });
  console.log("Vector store created:");
  console.log(`ID: ${store.id}`);
  console.log("Add this to .env.local.local as OPENAI_VECTOR_STORE_ID");
} catch (error) {
  console.error("Failed to create vector store", error);
  process.exit(1);
}
