import crypto from "node:crypto";
import type { ToolsModel } from "@be/tools/model/tools.model";
import {
	tempEmailCheckerController,
	type TempEmailCheckerDeps,
} from "@be/tools/routes/tools/temp-email-checker/temp-email-checker.controllers";
import { toolsConfig } from "@be/tools/tools.config";
import { redis } from "@be/tools/utils/loader";
import { createError, log } from "evlog";
import { parseCsvOrTextContent, parseJsonEmailArray } from "./csv-parser";
import {
	createBatchJobRecord,
	deriveHealthPresentation,
	getBatchJobRecord,
	processBatchJob,
} from "./job-processor";

import { checkImplicitMx } from "@be/tools/routes/tools/temp-email-checker/mx-lookup";

export async function singleEmailHealthCheckController(
	input: string,
	deps: TempEmailCheckerDeps = {},
): Promise<ToolsModel.EmailHealthCheckResponse> {
	const check = await tempEmailCheckerController(input, deps);

	let isImplicit = false;
	if (check.domain && check.mxRecords.length === 0) {
		isImplicit = await checkImplicitMx(check.domain);
	}

	const health = deriveHealthPresentation(input, check, isImplicit);
	const effectiveVerdict =
		check.mxRecords.length === 0 && check.verdict === "deliverable"
			? "invalid"
			: check.verdict;

	return {
		...check,
		verdict: effectiveVerdict,
		health,
	};
}

function generateJobToken(): string {
	return crypto.randomBytes(8).toString("hex");
}

async function checkBatchRateLimit(clientIp: string): Promise<void> {
	const key = `rate-limit:email-health-batch:${clientIp}`;
	try {
		const current = await redis.increment(key);
		if (current === 1) {
			await redis.expire(key, 3600);
		} else if (current > toolsConfig.constants.maxBatchJobsPerIpPerHour) {
			throw createError({
				status: 429,
				message: "Batch rate limit exceeded",
				why: `This endpoint allows ${toolsConfig.constants.maxBatchJobsPerIpPerHour} batch checks per hour from one IP.`,
				fix: "Wait before submitting another batch file or verify addresses individually.",
			});
		}
	} catch (error) {
		if ((error as { status?: number }).status === 429) throw error;
		// fail open on redis errors
	}
}

export async function createBatchHealthCheckController(
	params: {
		body?: { emails?: string[]; file?: unknown };
		clientIp: string;
	},
	deps: TempEmailCheckerDeps = {},
): Promise<ToolsModel.BatchCreateResponse> {
	await checkBatchRateLimit(params.clientIp);

	let parsed = {
		emails: [] as string[],
		totalUploaded: 0,
		totalUnique: 0,
		duplicatesRemoved: 0,
	};

	const file = params.body?.file;
	const emails = params.body?.emails;

	if (
		file &&
		typeof file === "object" &&
		"text" in file &&
		typeof (file as { text: unknown }).text === "function"
	) {
		// Multipart file upload (Blob/File)
		const blob = file as Blob;
		if (blob.size > toolsConfig.constants.maxBatchCsvBytes) {
			throw createError({
				status: 400,
				message: "File too large",
				why: `Maximum CSV file size is ${Math.round(toolsConfig.constants.maxBatchCsvBytes / 1024)} KB.`,
				fix: "Compress or trim your file to under 512 KB.",
			});
		}
		const text = await blob.text();
		parsed = parseCsvOrTextContent(text);
	} else if (typeof file === "string") {
		// Plain text string payload
		parsed = parseCsvOrTextContent(file);
	} else if (Array.isArray(emails)) {
		// JSON array
		parsed = parseJsonEmailArray(emails);
	} else {
		throw createError({
			status: 400,
			message: "Missing emails or file",
			why: "Request must include either an 'emails' array or a CSV 'file'.",
			fix: "Provide an array of email strings or upload a .csv / .txt file.",
		});
	}

	const token = generateJobToken();
	await createBatchJobRecord(
		token,
		parsed.totalUploaded,
		parsed.totalUnique,
		parsed.duplicatesRemoved,
	);

	// Start processing in background (non-blocking)
	void processBatchJob(token, parsed.emails, deps);

	log.info(
		"email-health-check",
		`Created batch job ${token} for IP ${params.clientIp} (${parsed.totalUnique} unique, ${parsed.duplicatesRemoved} duplicates removed)`,
	);

	return {
		token,
		status: "queued",
		pollUrl: `/api/tools/v1/email-health-check/batch/${token}`,
	};
}

export async function pollBatchHealthCheckController(
	token: string,
): Promise<ToolsModel.BatchPollResponse> {
	const job = await getBatchJobRecord(token);
	if (!job) {
		throw createError({
			status: 404,
			message: "Job not found",
			why: "The batch job token does not exist or has expired (1-hour retention).",
			fix: "Submit a new batch request to evaluate your list.",
		});
	}

	return {
		token: job.token,
		status: job.status,
		createdAt: job.createdAt,
		completedAt: job.completedAt,
		totalUploaded: job.totalUploaded,
		totalUnique: job.totalUnique,
		duplicatesRemoved: job.duplicatesRemoved,
		results: job.results,
		summary: job.summary,
		error: job.error,
	};
}
