import { logger } from "@reloop/logger";
import { Elysia, t } from "elysia";
import { getDkimConfigController } from "./kumomta-config.controllers";

export const kumomtaConfigRoute = new Elysia().get(
  "/config/dkim/:domain",
  async (context) => {
    const {
      params: { domain },
    } = context;
    const contextLogger = (context as any).logger;
    return await getDkimConfigController({
      domainName: domain,
      logger: contextLogger || logger,
    });
  },
  {
    params: t.Object({
      domain: t.String(),
    }),
    response: {
      200: t.Nullable(
        t.Object({
          domain: t.String(),
          selector: t.String(),
          privateKey: t.String(),
        }),
      ),
    },
    detail: {
      tags: ["Kumomta", "Internal"],
      summary: "Get DKIM config",
      description:
        "Internal endpoint for KumoMTA to fetch DKIM signing configuration for a domain.",
    },
  },
);
