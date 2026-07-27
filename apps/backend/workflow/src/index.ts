import "dotenv/config";
import { landing } from "@be/workflow/routes/landing/landing.index";
import {
	WORKBENCH_PATH,
	workbenchApp,
} from "@be/workflow/routes/workbench/workbench.route";
import { loader } from "@be/workflow/utils/loader";
import { workflowConfig } from "@be/workflow/workflow.config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import {
	requireUserAgentPlugin,
	secureHeadersPlugin,
} from "@reloop/auth/middleware";
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

/**
 * API routes under `/api/workflow`.
 * Workbench is mounted on the root app (not under this prefix) because
 * Elysia's nested `.mount()` + parent prefix breaks Workbench asset/API routing.
 */
const workflowApi = new Elysia({
	prefix: "/api/workflow",
	name: "Workflow Service",
})
	.use(secureHeadersPlugin({ profile: "api" }))
	.use(requireUserAgentPlugin())
	.use(
		evlog({
			exclude: ["/", "/api/*", "/api/*/", "**/health"],
		}),
	)
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
	.use(landing)
	.onStart(async () => {
		await loader();
	});

const workflowService = new Elysia({ name: "Workflow" })
	// Same Redis + workflow-queue as the worker — no extra process.
	.mount(WORKBENCH_PATH, workbenchApp)
	.use(workflowApi)
	.listen(port, () => {
		log.info(
			"server",
			`Workflow Server is running on http://localhost:${port}/api/workflow`,
		);
		log.info(
			"workbench",
			`BullMQ Workbench at http://localhost:${port}${WORKBENCH_PATH}`,
		);
	});

export type WorkflowService = typeof workflowService;
