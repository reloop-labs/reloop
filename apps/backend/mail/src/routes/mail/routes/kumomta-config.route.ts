import { getDkimConfig } from "@reloop/be-mail/routes/mail/controllers/kumomta-config.js";
import { logger } from "@reloop/logger";
import { Elysia, t } from "elysia";

/**
 * KumoMTA config API — serves DKIM keys from the database.
 * This route is UNAUTHENTICATED because KumoMTA's Lua policy
 * calls it internally from the Docker network.
 */
export const kumomtaConfigRoute = new Elysia().get(
  "/kumomta/dkim/:domain",
  async ({ params, set }) => {
    const { domain } = params;

    logger.debug({ domain }, "DKIM config requested by KumoMTA");

    const config = await getDkimConfig(domain);

    if (!config) {
      set.status = 404;
      return {
        error: "DKIM config not found",
        domain,
      };
    }

    return config;
  },
  {
    params: t.Object({
      domain: t.String({
        description: "Domain name to fetch DKIM config for",
        examples: ["example.com"],
      }),
    }),
    detail: {
      tags: ["KumoMTA"],
      summary: "Get DKIM signing config",
      description:
        "Internal endpoint for KumoMTA to fetch DKIM private keys and selector from the database",
    },
  },
);
