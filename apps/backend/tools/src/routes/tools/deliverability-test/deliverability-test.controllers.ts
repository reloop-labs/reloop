import crypto from "node:crypto";
import { toolsConfig } from "@be/tools/tools.config";
import { redis } from "@be/tools/utils/loader";
import { createError, log } from "evlog";
import { analyzeInboundEmail } from "./analyzer";
import type {
	CreateSessionResponse,
	DeliverabilitySession,
	GetSessionResponse,
} from "./deliverability-test.types";

type IngestResult = {
	success: boolean;
	token?: string;
	error?: string;
};

function generateToken(): string {
	return crypto.randomBytes(4).toString("hex");
}

function buildTesterAddress(token: string): string {
	if (toolsConfig.TESTER_EMAIL?.includes("@")) {
		const [user, domain] = toolsConfig.TESTER_EMAIL.split("@");
		return `${user}+${token}@${domain}`;
	}
	const domain = toolsConfig.TESTER_DOMAIN || "mail-test.reloop.email";
	return `${token}@${domain}`;
}

function normalizeToken(raw: string): string {
	let cleaned = raw.trim().toLowerCase();
	if (cleaned.includes("@")) {
		cleaned = cleaned.split("@")[0] || cleaned;
	}
	if (cleaned.includes("+")) {
		cleaned = cleaned.split("+")[1] || cleaned;
	}
	return cleaned.replace(/^test[-_]/, "");
}

export async function createDeliverabilityTestSession(
	clientIp: string,
): Promise<CreateSessionResponse> {
	const rateLimitKey = `rate-limit:deliverability-session:${clientIp}`;
	try {
		const current = await redis.increment(rateLimitKey);
		if (current === 1) {
			await redis.expire(rateLimitKey, 3600);
		} else if (current > toolsConfig.constants.maxSessionPerIpPerHour) {
			throw createError({
				status: 429,
				message: "Rate limit exceeded",
				why: `Too many test sessions created from this IP (limit: ${toolsConfig.constants.maxSessionPerIpPerHour} per hour).`,
				fix: "Wait a few minutes or reuse your active test address.",
			});
		}
	} catch (error) {
		if ((error as { status?: number }).status === 429) throw error;
	}

	const rawToken = generateToken();
	const token = `test-${rawToken}`;
	const address = buildTesterAddress(token);
	const now = new Date();
	const expiresAt = new Date(
		now.getTime() + toolsConfig.constants.testSessionTtlSeconds * 1000,
	).toISOString();

	const session: DeliverabilitySession = {
		token,
		address,
		status: "pending",
		createdAt: now.toISOString(),
		expiresAt,
	};

	const sessionKey = `deliverability-test:${rawToken}`;
	await redis.set(
		sessionKey,
		session,
		toolsConfig.constants.testSessionTtlSeconds,
	);
	await redis.set(
		`deliverability-test:${token}`,
		session,
		toolsConfig.constants.testSessionTtlSeconds,
	);

	log.info(
		"DeliverabilityTest",
		`Created session token=${token} address=${address} for ip=${clientIp}`,
	);

	return {
		token,
		address,
		expiresAt,
		pollUrl: `${toolsConfig.BASE_URL}/api/tools/v1/deliverability-test/${token}`,
	};
}

export async function getDeliverabilityTestSession(
	tokenParam: string,
): Promise<GetSessionResponse> {
	const rawToken = normalizeToken(tokenParam);
	const sessionKey = `deliverability-test:${rawToken}`;
	const session = await redis.get<DeliverabilitySession>(sessionKey);

	if (!session) {
		return {
			token: tokenParam,
			address: buildTesterAddress(`test-${rawToken}`),
			status: "expired",
			createdAt: new Date().toISOString(),
			expiresAt: new Date().toISOString(),
			error:
				"Test session not found or has expired. Tests are automatically deleted after 24 hours.",
		};
	}

	return {
		token: session.token,
		address: session.address,
		status: session.status,
		createdAt: session.createdAt,
		expiresAt: session.expiresAt,
		report: session.report,
		error: session.error,
	};
}

function extractRecipientAddress(rawMime: string): string | null {
	const headerBlock = rawMime.split(/\r?\n\r?\n/)[0] || rawMime;
	const recipientHeaderMatch = headerBlock.match(
		/(?:^|\n)(?:X-Original-To|X-Forwarded-To|Envelope-To|Delivered-To|To):\s*([^\r\n]+)/i,
	);
	const recipientHeaderValue = recipientHeaderMatch?.[1];
	if (recipientHeaderValue) {
		const emailMatch = recipientHeaderValue.match(
			/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
		);
		if (emailMatch) {
			return (emailMatch[1] || emailMatch[2] || "").toLowerCase().trim();
		}
	}

	const fallbackMatch = headerBlock.match(
		/\b([a-zA-Z0-9._-]+(?:\+[a-zA-Z0-9._-]+)?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i,
	);
	const fallbackAddress = fallbackMatch?.[1];
	if (fallbackAddress) {
		return fallbackAddress.toLowerCase().trim();
	}

	return null;
}

function collectTesterTokenCandidates(
	rawMime: string,
	recipient: string | null,
): string[] {
	const candidates: string[] = [];
	const seen = new Set<string>();

	const add = (value: string | undefined) => {
		if (!value) return;
		const token = normalizeToken(value);
		if (!token || seen.has(token)) return;
		seen.add(token);
		candidates.push(token);
	};

	if (recipient) {
		add(recipient.split("@")[0] || recipient);
	}

	const headerBlock = rawMime.split(/\r?\n\r?\n/)[0] || rawMime;
	for (const match of headerBlock.matchAll(/\+test-([a-f0-9]+)/gi)) {
		add(match[1]);
	}
	for (const match of headerBlock.matchAll(/(?:^|[\s<])test-([a-f0-9]+)@/gim)) {
		add(match[1]);
	}

	return candidates;
}

async function findSessionForInboundMime(
	rawMime: string,
	recipient: string | null,
): Promise<{ session: DeliverabilitySession; rawToken: string } | null> {
	for (const rawToken of collectTesterTokenCandidates(rawMime, recipient)) {
		const session = await redis.get<DeliverabilitySession>(
			`deliverability-test:${rawToken}`,
		);
		if (session) {
			return { session, rawToken };
		}
	}
	return null;
}

async function recipientFromParsedMime(
	rawMime: string,
): Promise<string | null> {
	try {
		const { parseMime } = await import("./analyzer/parse-mime");
		const parsed = await parseMime(rawMime);
		return parsed.to.address || null;
	} catch (parseError) {
		log.warn(
			"DeliverabilityTest",
			`MIME parse fallback failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
		);
		return null;
	}
}

async function persistSession(
	session: DeliverabilitySession,
	rawToken: string,
	patch: Partial<DeliverabilitySession>,
): Promise<DeliverabilitySession> {
	const updatedSession: DeliverabilitySession = {
		...session,
		...patch,
	};
	await redis.set(
		`deliverability-test:${rawToken}`,
		updatedSession,
		toolsConfig.constants.testSessionTtlSeconds,
	);
	await redis.set(
		`deliverability-test:${session.token}`,
		updatedSession,
		toolsConfig.constants.testSessionTtlSeconds,
	);
	return updatedSession;
}

async function completeTesterAnalysis(
	session: DeliverabilitySession,
	rawToken: string,
	rawMime: string,
): Promise<IngestResult> {
	try {
		const report = await analyzeInboundEmail(rawMime);
		await persistSession(session, rawToken, {
			status: "received",
			report,
		});
		log.info(
			"DeliverabilityTest",
			`Completed test for token=${session.token} score=${report.score}/10 verdict=${report.verdict}`,
		);
		return { success: true, token: session.token };
	} catch (analyzeError) {
		const message =
			analyzeError instanceof Error
				? analyzeError.message
				: String(analyzeError);
		await persistSession(session, rawToken, {
			status: "error",
			error: message,
		});
		log.error({
			message: "Error analyzing inbound tester email",
			error: message,
		});
		return { success: false, token: session.token, error: message };
	}
}

export async function processInboundTesterEmail(
	rawMime: string,
): Promise<IngestResult> {
	try {
		const recipient =
			extractRecipientAddress(rawMime) ??
			(await recipientFromParsedMime(rawMime));

		const found = await findSessionForInboundMime(rawMime, recipient);
		if (!found) {
			log.warn(
				"DeliverabilityTest",
				`No active test session found for recipient ${recipient ?? "(none)"}`,
			);
			return {
				success: false,
				error: recipient
					? `Session not found for recipient ${recipient}`
					: "Recipient header missing in MIME",
			};
		}

		const { session, rawToken } = found;
		log.info(
			"DeliverabilityTest",
			`Running analyzer suite for token=${session.token} address=${recipient ?? session.address}`,
		);
		return await completeTesterAnalysis(session, rawToken, rawMime);
	} catch (error) {
		log.error({
			message: "Error processing inbound tester email",
			error: error instanceof Error ? error.message : String(error),
		});
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
