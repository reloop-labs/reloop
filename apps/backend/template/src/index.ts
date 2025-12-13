import "dotenv/config";
import { templateConfig } from "@be/template/template.config";
import { landing } from "@be/template/routes/landing/landing.index";
import { templateRoutes } from "@be/template/routes/template/template.routes";
import { loader } from "@be/template/utils/loader";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = templateConfig.port;
const templateService = new Elysia({
    prefix: "/api/template",
    name: "Template Service",
})
    .use(
        openapi({
            references: fromTypes(
                templateConfig.NODE_ENV === "production"
                    ? "dist/index.d.ts"
                    : "src/index.ts",
            ),
        }),
    )
    .use(serverTiming())
    .use(landing)
    .use(templateRoutes)
    .onStart(async () => {
        await loader();
    })
    .listen(port, () => {
        logger.info(
            `Template Server is running on http://localhost:${port}/api/template`,
        );
    });

export type TemplateService = typeof templateService;
