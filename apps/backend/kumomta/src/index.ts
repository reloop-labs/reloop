import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { kumomtaRoutes } from "./routes/kumomta.routes";

const app = new Elysia({
  name: "Server",
})
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Reloop KumoMTA API",
          version: "1.0.0",
        },
        tags: [{ name: "KumoMTA", description: "KumoMTA Callbacks & Configs" }],
      },
      exclude: ["/swagger"],
    }),
  )
  .use(kumomtaRoutes)
  .listen(3008, (server) => {
    logger.info(
      `🦊 KumoMTA Server is running at http://${server?.hostname}:${server?.port}`,
    );
  });

export type App = typeof app;
