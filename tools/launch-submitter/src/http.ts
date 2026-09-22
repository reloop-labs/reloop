#!/usr/bin/env bun
import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { core } from "./core/index.ts";

const app = new Hono();
app.use("*", cors());

app.get("/health", (c) => c.json({ ok: true, service: "launch-submitter" }));

app.get("/products", async (c) => c.json(await core.listProducts()));
app.get("/directories", async (c) => c.json(await core.listDirectories()));

app.get("/plan/:productId", async (c) => {
	return c.json(await core.planProduct(c.req.param("productId")));
});

app.post("/runs", async (c) => {
	const body = (await c.req.json()) as {
		productId: string;
		only?: string[];
		dryRun?: boolean;
		headless?: boolean;
	};
	const run = await core.runSubmissions({
		productId: body.productId,
		only: body.only,
		dryRun: body.dryRun,
		headless: body.headless,
	});
	return c.json(core.summarizeRun(run));
});

app.get("/runs", async (c) => {
	const runs = await core.listRuns();
	return c.json(runs.map(core.summarizeRun));
});

app.get("/runs/latest", async (c) => c.json(await core.getStatus()));

app.get("/runs/:runId", async (c) => c.json(await core.getStatus(c.req.param("runId"))));

app.post("/runs/:runId/resume", async (c) => {
	const run = await core.resumeRun(c.req.param("runId"));
	return c.json(core.summarizeRun(run));
});

app.post("/resume", async (c) => {
	const run = await core.resumeRun();
	return c.json(core.summarizeRun(run));
});

app.post("/login", async (c) => {
	const result = await core.openLoginBrowser();
	return c.json(result);
});

const port = Number(process.env.LAUNCH_SUBMITTER_PORT ?? 8787);
console.log(`launch-submitter API on http://127.0.0.1:${port}`);
console.log(`UI: bun run ui  →  http://127.0.0.1:5173`);
serve({ fetch: app.fetch, port });
