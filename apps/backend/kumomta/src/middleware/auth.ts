import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { kumomtaConfig } from "../kumomta.config";

export const authMiddleware = new Elysia({ name: "auth-middleware" }).macro({
  kumomtaAuth: {
    resolve({ status, request: { headers } }) {
      try {
        const key = headers.get("x-kumomta-key");
        if (!key || key !== kumomtaConfig.X_KUMOMTA_KEY) {
          logger.warn("Unauthorized internal service call: Invalid or missing x-kumomta-key header");
          return status(401, { message: "Unauthorized" });
        }
      } catch (e) {
        logger.error({ error: e instanceof Error ? e.message : String(e) }, "Error validating internal authentication");
        return status(401, { message: "Authentication validation failed" });
      }
    },
    detail: {
      security: [{ apiKey: [] }],
    },
  },
});
