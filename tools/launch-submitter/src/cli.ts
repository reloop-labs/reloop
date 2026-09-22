#!/usr/bin/env bun
import { core } from "./core/index.ts";

function usage() {
	console.log(`launch-submitter — local free-directory submitter

Usage:
  bun run src/cli.ts <command> [options]

Commands:
  products              List product packs
  directories           List free directories
  plan --product <id>   Eligibility plan (required)
  run --product <id> [--only a,b] [--dry-run] [--headless]
  status [--run <id>]   Latest (or specific) run status
  resume [--run <id>]   Continue after captcha/login
  login                 Open persistent browser to sign in

Examples:
  bun run src/cli.ts products
  bun run src/cli.ts plan --product example
  bun run src/cli.ts run --product example --dry-run
  bun run src/cli.ts run --product my-app --only saashub,uneed
  bun run src/cli.ts resume
`);
}

function arg(flag: string): string | undefined {
	const i = process.argv.indexOf(flag);
	if (i < 0) return undefined;
	return process.argv[i + 1];
}

function has(flag: string) {
	return process.argv.includes(flag);
}

function requireProductId(): string {
	const productId = arg("--product");
	if (!productId) {
		throw new Error("Missing --product <id> (see: bun run src/cli.ts products)");
	}
	return productId;
}

async function main() {
	const cmd = process.argv[2];
	if (!cmd || cmd === "-h" || cmd === "--help") {
		usage();
		return;
	}

	switch (cmd) {
		case "products": {
			console.log(JSON.stringify(await core.listProducts(), null, 2));
			return;
		}
		case "directories": {
			const dirs = await core.listDirectories();
			console.log(
				dirs
					.map(
						(d) =>
							`${d.id.padEnd(18)} DR${String(d.domainRating ?? "?").padStart(3)}  ${d.name}  ${d.submitUrl}`,
					)
					.join("\n"),
			);
			return;
		}
		case "plan": {
			const productId = requireProductId();
			const result = await core.planProduct(productId);
			for (const item of result.plan) {
				const dr = item.domainRating != null ? `DR${item.domainRating}` : "DR?";
				console.log(`[${item.verdict}] ${item.directoryId} (${dr}) — ${item.reasons.join("; ")}`);
			}
			return;
		}
		case "run": {
			const productId = requireProductId();
			const only = arg("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
			const run = await core.runSubmissions({
				productId,
				only,
				dryRun: has("--dry-run"),
				headless: has("--headless"),
			});
			console.log(JSON.stringify(core.summarizeRun(run), null, 2));
			if (run.status === "paused") {
				console.log("\nPaused for human step. Solve captcha/login in the browser, then: bun run resume");
			}
			return;
		}
		case "status": {
			const status = await core.getStatus(arg("--run"));
			console.log(JSON.stringify(status, null, 2));
			return;
		}
		case "resume": {
			const run = await core.resumeRun(arg("--run"));
			console.log(JSON.stringify(core.summarizeRun(run), null, 2));
			return;
		}
		case "login": {
			await core.openLoginBrowser();
			console.log("Browser open with persistent profile. Sign in, then press Ctrl+C.");
			await new Promise(() => {});
			return;
		}
		default:
			usage();
			process.exitCode = 1;
	}
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
