import 'dotenv/config';

/**
 * Centralized, validated environment configuration.
 * Throws at startup if a required variable is missing, so the server fails fast
 * instead of erroring at request time.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  port: parseInt(process.env.PORT ?? '4000', 10),
  // Comma-separated list of allowed CORS origins. Defaults to local dev.
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
