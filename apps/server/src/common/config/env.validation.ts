import { z } from "zod";

const envSchema = z.object({
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  SERVER_PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().optional(),
});

export function validate(config: Record<string, unknown>) {
  const parsed = envSchema.parse(config);

  const databaseUrl = `postgresql://${parsed.DB_USER}:${parsed.DB_PASSWORD}@${parsed.DB_HOST}:${parsed.DB_PORT}/${parsed.DB_NAME}?schema=public`;

  return { ...parsed, DATABASE_URL: databaseUrl };
}
