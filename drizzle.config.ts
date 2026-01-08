import { config } from "dotenv";
config({ path: ".env" });

export default {
  schema: "./app/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
};
