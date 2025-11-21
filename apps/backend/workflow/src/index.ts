import "dotenv/config";
import { landing } from "@be/workflow/routes/landing/landing.index";
import { workflowConfig } from "@be/workflow/utils/workflow.config";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { inngestRoutes } from "./routes/inngest/inngest.router";

const port = Number(workflowConfig.port);

const workflowService = new Elysia({
	prefix: "/api/workflow",
	name: "Workflow Service",
})
	.use(landing)
	.use(inngestRoutes)
	.listen(port, () => {
		logger.info(
			`Workflow Service is running on http://localhost:${port}/api/workflow`,
		);
	});

export type WorkflowService = typeof workflowService;
