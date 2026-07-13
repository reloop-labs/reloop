#!/usr/bin/env bun
/**
 * Keep SDK code samples in sync across backend, dashboard, and docs.
 *
 * 1. Canonical: apps/backend/api-key route x-codeSamples.ts files
 * 2. Dashboard: generate api-keys-code-examples.ts
 * 3. Docs: sync MDX codeSamples from x-codeSamples
 *
 *   bun run sync:sdk-samples
 *   bun run sync:sdk-samples --check
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHECK = process.argv.includes("--check");
const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.join(SCRIPTS, "..");
const checkFlag = CHECK ? ["--check"] : [];

function run(script: string, extraArgs: string[] = []): void {
	const result = spawnSync(
		"bun",
		["run", path.join(SCRIPTS, script), ...extraArgs, ...checkFlag],
		{ stdio: "inherit", cwd: DOCS_ROOT },
	);
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

console.log(CHECK ? "Checking SDK samples…" : "Syncing SDK samples…");
run("sync-dashboard-api-key-samples.ts");
run("sync-code-samples-from-source.ts", ["api-key"]);
console.log(CHECK ? "All SDK sample checks passed." : "SDK samples synced.");
