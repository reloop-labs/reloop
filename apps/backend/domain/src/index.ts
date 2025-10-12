import "dotenv/config";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from "@elysiajs/swagger";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { landing } from "./landing";
import { loader } from "./loader";
import { domainRoutes } from "./routes/domain";
import { validationRoutes } from "./routes/validation";

const port = Number(process.env.PORT || 3000);
console.log(process.env.NODE_ENV);
const app = new Elysia({ prefix: "/api/domain", name: "Domain Service" })
	.use(serverTiming())
	.use(swagger({ path: "/docs" }))
	.use(landing)
	.use(domainRoutes)
	.use(validationRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Domain Server is running on http://localhost:${port}/api/domain`,
		);
	});

export type App = typeof app;
