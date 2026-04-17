import { type Logger, logger } from "@reloop/logger";
import { Elysia, t } from "elysia";
import { verifyDomainController } from "./verify-domain.controllers";

export const verifyDomainRoute = new Elysia().post(
  "/domain/verify",
  async (context) => {
    const domainName = context.body.domain;

    if (!domainName) {
      return context.status(400, { message: "Domain name missing" });
    }

    const contextLogger = (context as { logger?: Logger }).logger;
    const result = await verifyDomainController({
      domainName,
      logger: contextLogger || logger,
    });

    if (!result) {
      return context.status(404, { message: "Domain not found" });
    }

    return result;
  },
  {
    response: {
      200: t.Object({
        isVerified: t.Boolean(),
      }),
      400: t.Object({
        message: t.String(),
      }),
      404: t.Object({
        message: t.String(),
      }),
    },
    body: t.Object({
      domain: t.String(),
    }),
    detail: {
      summary: "Domain Verification Check",
      description: "Internal verification endpoint to check if a domain is verified.",
    },
  },
);
