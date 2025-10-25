import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { audienceRoutes } from "@reloop/audience/routes/audience/audience.routes";
import { landing } from "@reloop/audience/routes/landing/landing.index";
import { loader } from "@reloop/audience/utils/loader";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = Number(process.env.PORT || 3014);
const audienceService = new Elysia({
    prefix: "/api/audience",
    name: "Audience Service",
})
    .use(
        openapi({
            references: fromTypes(
                process.env.NODE_ENV === "production"
                    ? "dist/index.d.ts"
                    : "src/index.ts",
            ),
        }),
    )
    .use(serverTiming())
    .use(landing)
    .use(audienceRoutes)
    .onStart(async () => {
        await loader();
    })
    .listen(port, () => {
        logger.info(
            `Audience Server is running on http://localhost:${port}/api/audience`,
        );
    });

export type AudienceService = typeof audienceService;
