import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type BrowserContext, type Page } from "playwright";
import { createRun, loadLatestRunId, loadRun, saveRun, updateSubmission } from "../core/log.ts";
import { planSubmissions } from "../core/plan.ts";
import {
	browserProfileDir,
	getDirectory,
	getProduct,
	listDirectories,
	resolveProductLogo,
	runsDir,
} from "../core/store.ts";
import type { Directory, FillStep, Product, RunRecord } from "../core/types.ts";
import { detectHumanGate } from "./detect-human.ts";
import { notifyHuman } from "./notify.ts";

let sharedContext: BrowserContext | null = null;

async function getContext(headless = false): Promise<BrowserContext> {
	if (sharedContext) return sharedContext;
	await mkdir(browserProfileDir(), { recursive: true });
	sharedContext = await chromium.launchPersistentContext(browserProfileDir(), {
		headless,
		viewport: { width: 1280, height: 900 },
		args: ["--disable-blink-features=AutomationControlled"],
	});
	return sharedContext;
}

export async function closeBrowser() {
	if (sharedContext) {
		await sharedContext.close();
		sharedContext = null;
	}
}

function fieldValue(product: Product, step: FillStep): string {
	if (step.valueFrom === "literal") return step.literal ?? "";
	if (step.valueFrom === "categories") return product.categories.join(", ");
	if (step.valueFrom === "logoPath") return resolveProductLogo(product) ?? "";
	if (!step.valueFrom) return step.literal ?? "";
	const v = product[step.valueFrom as keyof Product];
	return v == null ? "" : String(v);
}

async function maybeHumanGate(
	page: Page,
	runId: string,
	directory: Directory,
	opts?: { force?: boolean; note?: string },
) {
	const gate = opts?.force
		? { kind: "login" as const, detail: opts.note ?? "Manual review required" }
		: await detectHumanGate(page);
	if (!gate) return false;

	const shotDir = path.join(runsDir(), runId);
	await mkdir(shotDir, { recursive: true });
	const shot = path.join(shotDir, `${directory.id}-needs-human.png`);
	await page.screenshot({ path: shot, fullPage: true }).catch(() => undefined);

	await updateSubmission(runId, directory.id, {
		status: "needs_human",
		url: page.url(),
		screenshot: shot,
		note: opts?.force ? (opts.note ?? "Paused for you to finish submit") : `${gate.kind}: ${gate.detail}`,
	});

	await notifyHuman(
		"Launch Submitter needs you",
		`${directory.name} — finish the form in the browser, then run: PLAYWRIGHT_BROWSERS_PATH=0 bun run src/cli.ts resume`,
	);
	return true;
}

async function runStep(page: Page, product: Product, step: FillStep) {
	switch (step.action) {
		case "goto": {
			if (!step.url) throw new Error("goto requires url");
			await page.goto(step.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
			return;
		}
		case "wait": {
			await page.waitForTimeout(step.ms ?? 1000);
			return;
		}
		case "click": {
			if (!step.selector) throw new Error("click requires selector");
			const loc = page.locator(step.selector).first();
			if (step.optional && !(await loc.isVisible().catch(() => false))) return;
			await loc.click({ timeout: 15_000 });
			return;
		}
		case "fill": {
			if (!step.selector) throw new Error("fill requires selector");
			const value = fieldValue(product, step);
			const loc = page.locator(step.selector).first();
			if (step.optional && !(await loc.isVisible().catch(() => false))) return;
			await loc.fill(value, { timeout: 15_000 });
			return;
		}
		case "select": {
			if (!step.selector) throw new Error("select requires selector");
			const value = fieldValue(product, step);
			const loc = page.locator(step.selector).first();
			if (step.optional && !(await loc.isVisible().catch(() => false))) return;
			await loc.selectOption({ label: value }).catch(async () => {
				await loc.selectOption({ value });
			});
			return;
		}
		case "upload": {
			if (!step.selector) throw new Error("upload requires selector");
			const file = fieldValue(product, step);
			if (!file) {
				if (step.optional) return;
				throw new Error("upload missing file path");
			}
			await page.locator(step.selector).first().setInputFiles(file);
			return;
		}
		case "press": {
			if (!step.selector) throw new Error("press requires selector");
			await page.locator(step.selector).first().press(step.literal ?? "Enter");
			return;
		}
		case "waitForNav": {
			await page.waitForLoadState("networkidle", { timeout: step.ms ?? 15_000 }).catch(() => undefined);
			return;
		}
		case "screenshot": {
			return;
		}
		case "humanGate": {
			return;
		}
		default: {
			const _exhaustive: never = step.action;
			throw new Error(`Unknown action: ${_exhaustive}`);
		}
	}
}

export async function openLoginBrowser() {
	const context = await getContext(false);
	const page = context.pages()[0] ?? (await context.newPage());
	await page.goto("https://www.google.com", { waitUntil: "domcontentloaded" });
	await notifyHuman(
		"Launch Submitter login",
		"Browser opened with persistent profile. Sign into directories you need, then close when done.",
	);
	return { message: "Persistent browser open. Sign in to needed sites, then Ctrl+C." };
}

export async function planProduct(productId: string) {
	const product = await getProduct(productId);
	const directories = await listDirectories();
	return {
		product: { id: product.id, name: product.name, url: product.url },
		plan: planSubmissions(product, directories),
	};
}

export async function runSubmissions(opts: {
	productId: string;
	only?: string[];
	headless?: boolean;
	dryRun?: boolean;
}): Promise<RunRecord> {
	const product = await getProduct(opts.productId);
	const all = await listDirectories();
	const planned = planSubmissions(product, all).filter((p) => p.verdict !== "out_of_reach");
	let targets = planned;
	if (opts.only?.length) {
		const set = new Set(opts.only);
		targets = planned.filter((p) => set.has(p.directoryId));
	}

	const names = new Map(targets.map((t) => [t.directoryId, t.directoryName]));
	const run = await createRun(
		product.id,
		targets.map((t) => t.directoryId),
		names,
	);

	if (opts.dryRun) {
		for (const t of targets) {
			await updateSubmission(run.id, t.directoryId, {
				status: "skipped",
				note: "dry-run",
				url: t.submitUrl,
			});
		}
		const done = await loadRun(run.id);
		done.status = "completed";
		await saveRun(done);
		return done;
	}

	const context = await getContext(opts.headless ?? false);
	const page = context.pages()[0] ?? (await context.newPage());

	for (const target of targets) {
		const directory = await getDirectory(target.directoryId);
		await updateSubmission(run.id, directory.id, {
			status: "running",
			url: directory.submitUrl,
		});

		try {
			for (const step of directory.steps) {
				if (step.action === "humanGate") {
					if (
						await maybeHumanGate(page, run.id, directory, {
							force: step.force,
							note: step.note,
						})
					) {
						return await loadRun(run.id);
					}
					continue;
				}
				await runStep(page, product, step);
				if (await maybeHumanGate(page, run.id, directory)) {
					return await loadRun(run.id);
				}
			}

			const shotDir = path.join(runsDir(), run.id);
			await mkdir(shotDir, { recursive: true });
			const shot = path.join(shotDir, `${directory.id}-submitted.png`);
			await page.screenshot({ path: shot, fullPage: true }).catch(() => undefined);

			await updateSubmission(run.id, directory.id, {
				status: "submitted",
				url: page.url(),
				screenshot: shot,
				note: directory.notes,
			});
		} catch (err) {
			const shotDir = path.join(runsDir(), run.id);
			await mkdir(shotDir, { recursive: true });
			const shot = path.join(shotDir, `${directory.id}-failed.png`);
			await page.screenshot({ path: shot, fullPage: true }).catch(() => undefined);
			await updateSubmission(run.id, directory.id, {
				status: "failed",
				url: page.url(),
				screenshot: shot,
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}

	const done = await loadRun(run.id);
	done.status = "completed";
	await saveRun(done);
	return done;
}

export async function resumeRun(runId?: string): Promise<RunRecord> {
	const id = runId ?? (await loadLatestRunId());
	if (!id) throw new Error("No run to resume");
	const run = await loadRun(id);
	const paused = run.submissions.find((s) => s.status === "needs_human");
	const remaining = run.submissions.filter((s) => s.status === "queued" || s.status === "needs_human");

	if (!remaining.length) {
		run.status = "completed";
		await saveRun(run);
		return run;
	}

	const product = await getProduct(run.productId);
	const context = await getContext(false);
	const page = context.pages()[0] ?? (await context.newPage());

	if (paused) {
		const still = await detectHumanGate(page);
		if (still) {
			await notifyHuman(
				"Still blocked",
				`${paused.directoryName} still needs ${still.kind}. Finish it, then resume again.`,
			);
			return run;
		}
		await updateSubmission(run.id, paused.directoryId, {
			status: "submitted",
			url: page.url(),
			note: "Resumed after human step",
		});
	}

	run.status = "running";
	await saveRun(run);

	for (const item of run.submissions) {
		if (item.status !== "queued") continue;
		const directory = await getDirectory(item.directoryId);
		await updateSubmission(run.id, directory.id, { status: "running", url: directory.submitUrl });
		try {
			for (const step of directory.steps) {
				if (step.action === "humanGate") {
					if (
						await maybeHumanGate(page, run.id, directory, {
							force: step.force,
							note: step.note,
						})
					) {
						return await loadRun(run.id);
					}
					continue;
				}
				await runStep(page, product, step);
				if (await maybeHumanGate(page, run.id, directory)) {
					return await loadRun(run.id);
				}
			}
			await updateSubmission(run.id, directory.id, {
				status: "submitted",
				url: page.url(),
			});
		} catch (err) {
			await updateSubmission(run.id, directory.id, {
				status: "failed",
				error: err instanceof Error ? err.message : String(err),
				url: page.url(),
			});
		}
	}

	const done = await loadRun(run.id);
	done.status = "completed";
	await saveRun(done);
	return done;
}

export async function getStatus(runId?: string) {
	const { loadLatestRunId, loadRun, listRuns, summarizeRun } = await import("../core/log.ts");
	if (runId) return summarizeRun(await loadRun(runId));
	const latest = await loadLatestRunId();
	if (!latest) {
		const runs = await listRuns();
		return { latest: null, runs: runs.map(summarizeRun) };
	}
	return summarizeRun(await loadRun(latest));
}
