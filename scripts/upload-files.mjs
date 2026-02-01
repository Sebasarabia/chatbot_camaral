import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

const envPathLocal = path.resolve(".env.local");
const envPath = path.resolve(".env");
if (fs.existsSync(envPathLocal)) {
  dotenv.config({ path: envPathLocal });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const apiKey = process.env.OPENAI_API_KEY;
const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

if (!apiKey || !vectorStoreId) {
  console.error("OPENAI_API_KEY and OPENAI_VECTOR_STORE_ID are required");
  process.exit(1);
}

const client = new OpenAI({ apiKey });
const kbDir = path.resolve("./kb");

if (!fs.existsSync(kbDir)) {
  console.error("KB directory not found. Create ./kb and add documents.");
  process.exit(1);
}

const entries = fs
  .readdirSync(kbDir)
  .filter((file) => !file.startsWith("."))
  .map((file) => path.join(kbDir, file));

if (entries.length === 0) {
  console.error("No files found in ./kb");
  process.exit(1);
}

try {
  const fileStreams = entries.map((filePath) => fs.createReadStream(filePath));

  const batch = await client.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, {
    files: fileStreams
  });

  console.log(`Uploaded files: ${batch.file_counts.completed} completed, ${batch.file_counts.failed} failed`);
} catch (error) {
  console.error("Failed to upload files", error);
  process.exit(1);
}
