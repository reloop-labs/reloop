import "dotenv/config";
import { landing } from "@be/upload/routes/landing/landing.index";
import { uploadRoutes } from "@be/upload/routes/upload/upload.routes";
import { uploadConfig } from "@be/upload/upload.config";
import { loader } from "@be/upload/utils/loader";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

const port = uploadConfig.port;
const uploadService = new Elysia({
    prefix: "/api/upload",
    name: "Upload Service",
})
    .use(
        openapi({
            references: fromTypes(
                uploadConfig.NODE_ENV === "production"
                    ? "dist/index.d.ts"
                    : "src/index.ts",
            ),
        }),
    )
    .use(serverTiming())
    .use(landing)
    .use(uploadRoutes)
    .onStart(async () => {
        await loader();
    })
    .listen(port, () => {
        logger.info(
            `Upload Server is running on http://localhost:${port}/api/upload`,
        );
    });

export type UploadService = typeof uploadService;
