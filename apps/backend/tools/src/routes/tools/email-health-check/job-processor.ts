import type { ToolsModel } from "@be/tools/model/tools.model";
import {
	checkImplicitMx,
	detectSmtpProvider,
	lookupMxRecords,
	type MxLookupResult,
} from "@be/tools/routes/tools/temp-email-checker/mx-lookup";
import { tempEmailCheckerController } from "@be/tools/routes/tools/temp-email-checker/temp-email-checker.controllers";
import { toolsConfig } from "@be/tools/tools.config";
import { redis } from "@be/tools/utils/loader";
import { log } from "evlog";

export type EmailHealthJob = {
	token: string;
	status: "queued" | "running" | "done" | "failed";
	createdAt: string;
	completedAt: string | null;
	totalUploaded: number;
	totalUnique: number;
	duplicatesRemoved: number;
	results: ToolsModel.BatchRowResult[];
	summary: ToolsModel.BatchSummary | null;
	error: string | null;
};

const BATCH_CONCURRENCY = 10;

export function deriveHealthPresentation(
	email: string,
	check: {
		input: string;
		domain: string | null;
		verdict: "invalid" | "disposable" | "risky" | "deliverable";
		flags: string[];
		isValidSyntax?: boolean;
		isRoleAddress?: boolean;
		isDisposable?: boolean;
		isFreeProvider?: boolean;
		mxRecords?: string[];
	},
	implicitMx = false,
): ToolsModel.HealthPresentation {
	const raw = email.trim();
	const user = raw.includes("@") ? raw.slice(0, raw.lastIndexOf("@")) : raw;
	const domain =
		check.domain ||
		(raw.includes("@") ? raw.slice(raw.lastIndexOf("@") + 1) : null);
	const tag = user.includes("+") ? user.slice(user.indexOf("+") + 1) : null;

	const numericalCharacters = (user.match(/[0-9]/g) || []).length;
	const alphabeticalCharacters = (user.match(/[a-zA-Z]/g) || []).length;
	const unicodeSymbols = (user.match(/[^\x00-\x7F]/g) || []).length;
	const lowerUser = user.toLowerCase();
	const noReply =
		lowerUser.startsWith("noreply") ||
		lowerUser.startsWith("no-reply") ||
		lowerUser.startsWith("donotreply");

	const mxRecords = check.mxRecords || [];
	const hasMx = mxRecords.length > 0;
	const mxRecord = hasMx ? mxRecords[0]! : implicitMx && domain ? domain : null;
	const smtpProvider = detectSmtpProvider(mxRecords);

	let state: "deliverable" | "undeliverable" | "risky" | "unknown" =
		"deliverable";
	let score = 100;
	let reason:
		| "accepted_email"
		| "rejected_email"
		| "no_mx_records"
		| "disposable_domain"
		| "invalid_syntax"
		| "role_based"
		| "low_deliverability" = "accepted_email";
	let status: "pass" | "fail" | "warn" = "pass";
	let summary = "Address is deliverable with active MX mail records.";

	if (check.flags.includes("INVALID_SYNTAX") || check.isValidSyntax === false) {
		state = "undeliverable";
		score = 0;
		reason = "invalid_syntax";
		status = "fail";
		summary = "Failed standard RFC email syntax checks.";
	} else if (
		check.verdict === "disposable" ||
		check.isDisposable ||
		check.flags.includes("DISPOSABLE_DOMAIN")
	) {
		state = "undeliverable";
		score = 0;
		reason = "disposable_domain";
		status = "fail";
		summary = "Disposable / temporary throwaway mailbox provider.";
	} else if (!hasMx || check.flags.includes("NO_MX_RECORDS")) {
		state = "undeliverable";
		score = 0;
		reason = "no_mx_records";
		status = "fail";
		summary = implicitMx
			? "Domain does not accept mail (no dedicated MX records configured)."
			: "Domain does not accept mail (no active MX records found).";
	} else if (
		check.verdict === "risky" ||
		check.isRoleAddress ||
		check.flags.includes("ROLE_BASED_PREFIX")
	) {
		state = "risky";
		score = 65;
		reason = "role_based";
		status = "warn";
		summary = "Role-based team mailbox (lower engagement rate).";
	} else if (check.flags.includes("PUBLIC_INBOX_DETECTED")) {
		state = "risky";
		score = 50;
		reason = "low_deliverability";
		status = "warn";
		summary = "Public mailbox provider with elevated bounce risk.";
	}

	return {
		status,
		summary,
		state,
		score,
		reason,
		user,
		domain,
		tag,
		attributes: {
			free: !!check.isFreeProvider,
			role: !!check.isRoleAddress || check.flags.includes("ROLE_BASED_PREFIX"),
			disposable:
				!!check.isDisposable || check.flags.includes("DISPOSABLE_DOMAIN"),
			acceptAll: false,
			tag: tag !== null,
			numericalCharacters,
			alphabeticalCharacters,
			unicodeSymbols,
			mailboxFull: false,
			noReply,
			secureEmailGateway: smtpProvider !== null,
		},
		mailServer: {
			smtpProvider,
			mxRecord,
			mxRecords,
			implicitMxRecord: implicitMx,
			hasMx,
		},
	};
}

export function getJobRedisKey(token: string): string {
	return `email-health-check:${token}`;
}

export async function createBatchJobRecord(
	token: string,
	totalUploaded: number,
	totalUnique: number,
	duplicatesRemoved: number,
): Promise<EmailHealthJob> {
	const job: EmailHealthJob = {
		token,
		status: "queued",
		createdAt: new Date().toISOString(),
		completedAt: null,
		totalUploaded,
		totalUnique,
		duplicatesRemoved,
		results: [],
		summary: null,
		error: null,
	};

	await redis.set(
		getJobRedisKey(token),
		job,
		toolsConfig.constants.batchJobTtlSeconds,
	);

	return job;
}

export async function getBatchJobRecord(
	token: string,
): Promise<EmailHealthJob | null> {
	const job = await redis.get<EmailHealthJob>(getJobRedisKey(token));
	return job ?? null;
}

export async function updateBatchJobRecord(
	token: string,
	patch: Partial<EmailHealthJob>,
): Promise<void> {
	const existing = await getBatchJobRecord(token);
	if (!existing) return;
	const updated: EmailHealthJob = { ...existing, ...patch };
	await redis.set(
		getJobRedisKey(token),
		updated,
		toolsConfig.constants.batchJobTtlSeconds,
	);
}

export async function processBatchJob(
	token: string,
	emails: string[],
	deps: { lookupMx?: (domain: string) => Promise<MxLookupResult> } = {},
): Promise<void> {
	try {
		await updateBatchJobRecord(token, { status: "running" });

		// Per-job MX cache keyed by domain so multiple same-domain emails do 1 DNS lookup
		const mxCache = new Map<string, Promise<MxLookupResult>>();
		const customLookupMx = (domain: string): Promise<MxLookupResult> => {
			const key = domain.toLowerCase();
			if (!mxCache.has(key)) {
				const lookupFn = deps.lookupMx ?? lookupMxRecords;
				mxCache.set(key, lookupFn(key));
			}
			return mxCache.get(key)!;
		};

		const results: ToolsModel.BatchRowResult[] = [];

		// Process in bounded chunks of BATCH_CONCURRENCY
		for (let i = 0; i < emails.length; i += BATCH_CONCURRENCY) {
			const chunk = emails.slice(i, i + BATCH_CONCURRENCY);
			const chunkPromises = chunk.map(async (email, indexInChunk) => {
				const rowNumber = i + indexInChunk + 1;
				try {
					const check = await tempEmailCheckerController(email, {
						lookupMx: customLookupMx,
					});

					// If no explicit MX, check implicit MX (A record)
					let isImplicit = false;
					if (check.domain && check.mxRecords.length === 0) {
						isImplicit = await checkImplicitMx(check.domain);
					}

					const health = deriveHealthPresentation(email, check, isImplicit);
					const effectiveVerdict =
						check.mxRecords.length === 0 && check.verdict === "deliverable"
							? "invalid"
							: check.verdict;

					return {
						email,
						rowNumber,
						domain: check.domain,
						verdict: effectiveVerdict,
						isValidSyntax: check.isValidSyntax,
						isDisposable: check.isDisposable,
						isRoleAddress: check.isRoleAddress,
						isFreeProvider: check.isFreeProvider,
						mxRecords: check.mxRecords,
						confidence: check.confidence,
						riskScore: check.riskScore,
						flags: check.flags,
						health,
					} satisfies ToolsModel.BatchRowResult;
				} catch {
					return {
						email,
						rowNumber,
						domain: null,
						verdict: "invalid",
						isValidSyntax: false,
						isDisposable: false,
						isRoleAddress: false,
						isFreeProvider: false,
						mxRecords: [],
						confidence: 0,
						riskScore: 1,
						flags: ["INVALID_SYNTAX"],
						health: {
							status: "fail",
							summary: "Failed validation evaluation.",
							state: "undeliverable",
							score: 0,
							reason: "invalid_syntax",
							user: email,
							domain: null,
							tag: null,
							attributes: {
								free: false,
								role: false,
								disposable: false,
								acceptAll: false,
								tag: false,
								numericalCharacters: 0,
								alphabeticalCharacters: 0,
								unicodeSymbols: 0,
								mailboxFull: false,
								noReply: false,
								secureEmailGateway: false,
							},
							mailServer: {
								smtpProvider: null,
								mxRecord: null,
								mxRecords: [],
								implicitMxRecord: false,
								hasMx: false,
							},
						},
					} satisfies ToolsModel.BatchRowResult;
				}
			});

			const chunkResults = await Promise.all(chunkPromises);
			results.push(...chunkResults);
		}

		// Calculate list summary stats
		let deliverableCount = 0;
		let riskyCount = 0;
		let disposableCount = 0;
		let invalidCount = 0;
		let noMxCount = 0;
		let totalRiskScore = 0;

		for (const r of results) {
			if (r.verdict === "deliverable") deliverableCount++;
			else if (r.verdict === "risky") riskyCount++;
			else if (r.verdict === "disposable") disposableCount++;
			else if (r.verdict === "invalid") invalidCount++;

			if (r.mxRecords.length === 0) noMxCount++;
			totalRiskScore += r.riskScore;
		}

		const totalUnique = results.length;
		const avgRiskScore =
			totalUnique > 0
				? Math.round((totalRiskScore / totalUnique) * 100) / 100
				: 0;
		const healthyPct =
			totalUnique > 0 ? Math.round((deliverableCount / totalUnique) * 100) : 0;

		const existing = await getBatchJobRecord(token);
		const totalUploaded = existing?.totalUploaded ?? totalUnique;
		const duplicatesRemoved = existing?.duplicatesRemoved ?? 0;

		const summary: ToolsModel.BatchSummary = {
			totalUploaded,
			totalUnique,
			duplicatesRemoved,
			deliverableCount,
			riskyCount,
			disposableCount,
			invalidCount,
			noMxCount,
			avgRiskScore,
			healthyPct,
		};

		await updateBatchJobRecord(token, {
			status: "done",
			completedAt: new Date().toISOString(),
			results,
			summary,
		});

		log.info(
			"email-health-check",
			`Batch job ${token} completed: ${totalUnique} evaluated, ${healthyPct}% healthy`,
		);
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		log.error({
			error: errorMessage,
			message: `Batch job ${token} failed`,
		});
		await updateBatchJobRecord(token, {
			status: "failed",
			completedAt: new Date().toISOString(),
			error: errorMessage,
		});
	}
}
