import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// Load Environment Variables
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    const response = await ai.models.list();
    console.log('Iterating over models:');
    for await (const model of response) {
      console.log(` - ${model.name}`);
    }
  } catch (err) {
    console.error('Failed to list models:', err);
  }
}

main();
