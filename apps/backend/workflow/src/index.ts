import "dotenv/config";
import { landing } from "@be/workflow/routes/landing/landing.index";
import cors from "@elysiajs/cors";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { inngestRoutes } from "./routes/inngest/inngest.router";

const port = 8017;

const workflowService = new Elysia({
	prefix: "/api/workflow",
	name: "Workflow Service",
})
	.use(cors())
	.use(landing)
	.use(inngestRoutes)
	.listen(port, () => {
		logger.info(
			`Workflow Service is running on http://localhost:${port}/api/workflow`,
		);
	});

export type WorkflowService = typeof workflowService;
