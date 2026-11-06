import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// neon deploy ተለዋዋጮቹን ወደ .env.local ያወርዳል።
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migration በቀጥታ ግንኙነት መሮጥ አለበት፤ pooler አይደለም።
  datasource: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
});
