import "dotenv/config";
import path from "node:path";
import { workflowQueue } from "@be/workflow/queues/workflow.queue";
import { landing } from "@be/workflow/routes/landing/landing.index";
import { loader } from "@be/workflow/utils/loader";
import { workflowConfig } from "@be/workflow/workflow.config";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ElysiaAdapter } from "@bull-board/elysia";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { createOTLPDrain } from "evlog/otlp";
import pkg from "../package.json";

const parseOtlpHeaders = (
	headersStr?: string,
): Record<string, string> | undefined => {
	if (!headersStr) return undefined;
	const headers: Record<string, string> = {};
	const decoded = decodeURIComponent(headersStr);
	for (const pair of decoded.split(",")) {
		const eqIndex = pair.indexOf("=");
		if (eqIndex > 0) {
			const key = pair.slice(0, eqIndex).trim();
			const value = pair.slice(eqIndex + 1).trim();
			if (key && value) headers[key] = value;
		}
	}
	return Object.keys(headers).length > 0 ? headers : undefined;
};

initLogger({
	env: { service: "workflow" },
	drain: workflowConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: workflowConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(workflowConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = workflowConfig.port;

const serverAdapter = new ElysiaAdapter({
	prefix: "/bull-board",
	basePath: "/api/workflow/bull-board",
});

createBullBoard({
	queues: [new BullMQAdapter(workflowQueue)],
	serverAdapter,
	options: {
		uiBasePath:
			process.env.NODE_ENV === "production"
				? path.resolve(process.cwd(), "./node_modules/@bull-board/ui")
				: path.resolve(process.cwd(), "../../../node_modules/@bull-board/ui"),
	},
});

const workflowService = new Elysia({
	prefix: "/api/workflow",
	name: "Workflow Service",
})
	.use(evlog())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Workflow Service",
					version: pkg.version,
				},
				components: {
					securitySchemes: {
						apiKey: {
							type: "apiKey",
							name: "x-api-key",
							in: "header",
						},
					},
				},
			},
		}),
	)
	.use(serverTiming())
	.onError(({ error, set }) => {
		const parsed = parseError(error);
		set.status = parsed.status;
		return {
			message: parsed.message,
			why: parsed.why,
			fix: parsed.fix,
			link: parsed.link,
		};
	})
	.use(await serverAdapter.registerPlugin())
	.use(landing)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"server",
			`Workflow Server is running on http://localhost:${port}/api/workflow`,
		);
		log.info(
			"server",
			`Bull Board is running on http://localhost:${port}/api/workflow/bull-board`,
		);
	});

export type WorkflowService = typeof workflowService;
