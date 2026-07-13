#!/usr/bin/env bun
/**
 * Keep SDK code samples in sync across backend, dashboard, and docs.
 *
 * 1. Canonical: apps/backend/api-key route x-codeSamples.ts files
 * 2. Dashboard: generate api-keys-code-examples.ts
 * 3. Docs: sync MDX codeSamples from x-codeSamples
 *
 * From monorepo root:
 *   bun run sync:sdk-samples
 *   bun run sync:sdk-samples --check
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHECK = process.argv.includes("--check");
const REPO_ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const SCRIPTS = path.join(REPO_ROOT, "scripts");
const DOCS_SCRIPTS = path.join(REPO_ROOT, "apps/frontend/docs/scripts");
const checkFlag = CHECK ? ["--check"] : [];

function run(
	scriptPath: string,
	extraArgs: string[] = [],
	cwd = REPO_ROOT,
): void {
	const result = spawnSync(
		"bun",
		["run", scriptPath, ...extraArgs, ...checkFlag],
		{ stdio: "inherit", cwd },
	);
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

console.log(CHECK ? "Checking SDK samples…" : "Syncing SDK samples…");
run(path.join(SCRIPTS, "sync-dashboard-api-key-samples.ts"));
run(
	path.join(DOCS_SCRIPTS, "sync-code-samples-from-source.ts"),
	["api-key"],
	path.join(REPO_ROOT, "apps/frontend/docs"),
);
console.log(CHECK ? "All SDK sample checks passed." : "SDK samples synced.");
