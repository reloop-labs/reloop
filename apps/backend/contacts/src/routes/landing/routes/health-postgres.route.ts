import { db } from "@reloop/db/client";
import { Elysia } from "elysia";

export const healthPostgresRoute = new Elysia().get(
  "/health/postgres",
  async () => {
    try {
      await db.execute("SELECT 1 as test");
      return {
        status: "CONNECTED",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "DISCONNECTED",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  },
  {
    detail: {
      tags: ["Service"],
      summary: "Health check for Postgres",
      description: "Checks the health of the Postgres database",
    },
  },
);
