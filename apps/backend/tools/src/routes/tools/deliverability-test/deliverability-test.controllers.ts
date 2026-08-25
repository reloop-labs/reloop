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

function generateToken(): string {
	return crypto.randomBytes(4).toString("hex");
}

function normalizeToken(raw: string): string {
	return raw.trim().toLowerCase().replace(/^test[-_]/, "");
}

export async function createDeliverabilityTestSession(
	clientIp: string,
): Promise<CreateSessionResponse> {
	// IP rate limiting: max 30 tests per hour per IP
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
	} catch (e) {
		if ((e as { status?: number }).status === 429) throw e;
		// If redis fails, fail-open for session creation
	}

	const rawToken = generateToken();
	const token = `test-${rawToken}`;
	const address = `${token}@${toolsConfig.TESTER_DOMAIN}`;
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
	// Store with token key and raw token key for reliable lookup
	await redis.set(sessionKey, session, toolsConfig.constants.testSessionTtlSeconds);
	await redis.set(
		`deliverability-test:${token}`,
		session,
		toolsConfig.constants.testSessionTtlSeconds,
	);

	log.info("DeliverabilityTest", `Created session token=${token} address=${address} for ip=${clientIp}`);

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
		// Session expired or not found
		return {
			token: tokenParam,
			address: `test-${rawToken}@${toolsConfig.TESTER_DOMAIN}`,
			status: "expired",
			createdAt: new Date().toISOString(),
			expiresAt: new Date().toISOString(),
			error: "Test session not found or has expired. Tests are automatically deleted after 24 hours.",
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

	// 1. Look in recipient headers: To, Delivered-To, Envelope-To, X-Original-To
	const recipientHeaderMatch = headerBlock.match(
		/(?:^|\n)(?:To|Delivered-To|Envelope-To|X-Original-To|X-Forwarded-To):\s*([^\r\n]+)/i,
	);

	if (recipientHeaderMatch && recipientHeaderMatch[1]) {
		const emailMatch = recipientHeaderMatch[1].match(
			/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
		);
		if (emailMatch) {
			return (emailMatch[1] || emailMatch[2] || "").toLowerCase().trim();
		}
	}

	// 2. Fallback: search header block for any test-* email address
	const fallbackMatch = headerBlock.match(
		/\b(test-[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i,
	);
	if (fallbackMatch && fallbackMatch[1]) {
		return fallbackMatch[1].toLowerCase().trim();
	}

	return null;
}

/**
 * Ingest and process an incoming MIME message for the deliverability tester
 */
export async function processInboundTesterEmail(
	rawMime: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
	try {
		const recipient = extractRecipientAddress(rawMime);

		if (!recipient) {
			log.warn("DeliverabilityTest", "Could not extract recipient from inbound MIME");
			return { success: false, error: "Recipient header missing in MIME" };
		}

		const [localPart, domainPart] = recipient.split("@");

		if (!domainPart || !localPart) {
			return { success: false, error: "Invalid recipient format" };
		}

		const rawToken = normalizeToken(localPart);
		const sessionKey = `deliverability-test:${rawToken}`;

		const session = await redis.get<DeliverabilitySession>(sessionKey);
		if (!session) {
			log.warn("DeliverabilityTest", `No active test session found for recipient ${recipient}`);
			return { success: false, error: `Session not found for token ${rawToken}` };
		}

		log.info("DeliverabilityTest", `Running analyzer suite for token=${session.token} address=${recipient}`);

		// Run analyzer
		const report = await analyzeInboundEmail(rawMime);

		// Update session in Redis
		const updatedSession: DeliverabilitySession = {
			...session,
			status: "received",
			report,
		};

		await redis.set(sessionKey, updatedSession, toolsConfig.constants.testSessionTtlSeconds);
		await redis.set(
			`deliverability-test:${session.token}`,
			updatedSession,
			toolsConfig.constants.testSessionTtlSeconds,
		);

		log.info(
			"DeliverabilityTest",
			`Completed test for token=${session.token} score=${report.score}/10 verdict=${report.verdict}`,
		);

		return { success: true, token: session.token };
	} catch (e) {
		log.error({
			message: "Error processing inbound tester email",
			error: e instanceof Error ? e.message : String(e),
		});
		return { success: false, error: e instanceof Error ? e.message : String(e) };
	}
}
