import type { Config } from 'drizzle-kit'

export default {
  schema: "./database/drizzle/schema.ts",
  out: "./database/drizzle/migrations",
  driver: "libsql",
  dbCredentials: {
    url: process.env.NODE_ENV === 'development' 
      ? "file:./database/data/database.db"
      : process.env.TURSO_DATABASE_URL || "file:./database/data/database.db",
    ...(process.env.TURSO_AUTH_TOKEN && { authToken: process.env.TURSO_AUTH_TOKEN })
  }
} satisfies Config 