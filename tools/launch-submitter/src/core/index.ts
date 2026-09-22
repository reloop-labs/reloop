import { listDirectories, listProducts } from "./store.ts";
import { listRuns, loadLatestRunId, loadRun, summarizeRun } from "./log.ts";
import { planProduct, resumeRun, runSubmissions, openLoginBrowser, getStatus, closeBrowser } from "../runner/runner.ts";

export const core = {
	listProducts,
	listDirectories,
	planProduct,
	runSubmissions,
	resumeRun,
	getStatus,
	openLoginBrowser,
	closeBrowser,
	listRuns,
	loadRun,
	loadLatestRunId,
	summarizeRun,
};

export type Core = typeof core;
