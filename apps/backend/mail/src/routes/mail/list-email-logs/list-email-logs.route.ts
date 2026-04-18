import { authMiddleware } from "@reloop/be-mail/middleware/auth";
import { MailModel } from "@reloop/be-mail/model/mail.model.js";
import { Elysia } from "elysia";
import { listEmailLogsController } from "./list-email-logs.controllers";

export const listEmailLogsRoute = new Elysia()
  .use(authMiddleware)
  .get(
    "/logs",
    async ({ query, set, activeOrganizationId, logger }) => {
      try {
        if (!activeOrganizationId) {
          set.status = 403;
          return { message: "Authentication required" };
        }
        const result = await listEmailLogsController({
          query,
          organizationId: activeOrganizationId,
          logger,
        });
        return result;
      } catch (error) {
        set.status = 500;
        return {
          message:
            error instanceof Error ? error.message : "Internal Server Error",
        };
      }
    },
    {
      auth: true,
      query: MailModel.listEmailLogsQuery,
      response: {
        200: MailModel.listEmailLogsResponse,
        500: MailModel.internalServerError,
      },
      detail: {
        description: "List email logs for the organization",
        tags: ["Mail"],
      },
    },
  );
