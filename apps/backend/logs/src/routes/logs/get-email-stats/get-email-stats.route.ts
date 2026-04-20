import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { getEmailStatsController } from "./get-email-stats.controllers";

export const getEmailStatsRoute = new Elysia().use(authMiddleware).get(
  "/emails/stats",
  async ({ query, activeOrganizationId }) => {
    return await getEmailStatsController({
      query: query as LogsModel.EmailStatsQuery,
      organizationId: activeOrganizationId as string,
    });
  },
  {
    auth: true,
    query: LogsModel.emailStatsQuery,
    response: {
      200: LogsModel.emailStatsResponse,
      401: LogsModel.errorResponse,
      403: LogsModel.errorResponse,
      500: LogsModel.errorResponse,
    },
    detail: {
      tags: ["Logs"],
      summary: "Get Email Stats",
      description: "Returns aggregated email statistics for charts.",
    },
  },
);
