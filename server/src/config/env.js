import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: serverEnvPath });

const envSchema = z.object({
  PORT: z
    .string()
    .default('5001')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 5001 : parsed;
    }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required and cannot be empty'),
  MONGODB_DB: z.string().default('ai_chat_assistant'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().url().optional().or(z.literal('')),
  AI_MOCK: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1')
    .default('false'),
  CLIENT_URL: z.string().default('http://localhost:5173')
});

const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Environment validation failed. Please check server/.env:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = validateEnv();
export default env;
