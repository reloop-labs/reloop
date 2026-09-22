import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RunRecord, SubmissionRecord } from "./types.ts";
import { runsDir } from "./store.ts";

async function ensureRunsDir() {
	await mkdir(runsDir(), { recursive: true });
}

function runPath(runId: string) {
	return path.join(runsDir(), `${runId}.json`);
}

export async function createRun(productId: string, directoryIds: string[], names: Map<string, string>): Promise<RunRecord> {
	await ensureRunsDir();
	const id = `run-${new Date().toISOString().replace(/[:.]/g, "-")}-${productId}`;
	const now = new Date().toISOString();
	const run: RunRecord = {
		id,
		productId,
		startedAt: now,
		updatedAt: now,
		status: "running",
		submissions: directoryIds.map((directoryId) => ({
			directoryId,
			directoryName: names.get(directoryId) ?? directoryId,
			status: "queued",
			at: now,
		})),
	};
	await writeFile(runPath(id), JSON.stringify(run, null, 2));
	await writeFile(path.join(runsDir(), "latest.json"), JSON.stringify({ runId: id }, null, 2));
	return run;
}

export async function loadRun(runId: string): Promise<RunRecord> {
	return JSON.parse(await readFile(runPath(runId), "utf8")) as RunRecord;
}

export async function loadLatestRunId(): Promise<string | null> {
	try {
		const raw = JSON.parse(await readFile(path.join(runsDir(), "latest.json"), "utf8")) as {
			runId: string;
		};
		return raw.runId;
	} catch {
		return null;
	}
}

export async function saveRun(run: RunRecord) {
	run.updatedAt = new Date().toISOString();
	await ensureRunsDir();
	await writeFile(runPath(run.id), JSON.stringify(run, null, 2));
	await writeFile(path.join(runsDir(), "latest.json"), JSON.stringify({ runId: run.id }, null, 2));
}

export async function updateSubmission(
	runId: string,
	directoryId: string,
	patch: Partial<SubmissionRecord>,
): Promise<RunRecord> {
	const run = await loadRun(runId);
	const idx = run.submissions.findIndex((s) => s.directoryId === directoryId);
	if (idx < 0) throw new Error(`Submission not found: ${directoryId}`);
	run.submissions[idx] = {
		...run.submissions[idx],
		...patch,
		at: new Date().toISOString(),
	};
	if (patch.status === "needs_human") run.status = "paused";
	await saveRun(run);
	return run;
}

export async function listRuns(): Promise<RunRecord[]> {
	await ensureRunsDir();
	const files = (await readdir(runsDir())).filter((f) => f.startsWith("run-") && f.endsWith(".json"));
	const runs: RunRecord[] = [];
	for (const file of files) {
		runs.push(JSON.parse(await readFile(path.join(runsDir(), file), "utf8")) as RunRecord);
	}
	return runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function summarizeRun(run: RunRecord) {
	const counts: Record<string, number> = {};
	for (const s of run.submissions) {
		counts[s.status] = (counts[s.status] ?? 0) + 1;
	}
	return {
		id: run.id,
		productId: run.productId,
		status: run.status,
		startedAt: run.startedAt,
		updatedAt: run.updatedAt,
		counts,
		submissions: run.submissions,
	};
}
