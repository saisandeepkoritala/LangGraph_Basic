import dotenv from 'dotenv';
import {z} from 'zod';
dotenv.config();



const EnvSchema = z.object({
    OPENAI_API_KEY : z.string(),
    OPENAI_MODEL:z.string(),
    PORT:z.string().default('5000')
});

const parsed = EnvSchema.safeParse(process.env);

if(!parsed.success) throw new Error('Error parsing env');

const rawEnv = parsed.data;

export const env = Object.freeze({
    OPENAI_API_KEY : rawEnv.OPENAI_API_KEY,
    OPENAI_MODEL : rawEnv.OPENAI_MODEL,
    PORT : rawEnv.PORT
});
