import { adminConfig } from "@reloop/admin/admin.config";
import { log } from "evlog";

export interface SlackSupportAlertInput {
	conversationId: string;
	userName: string | null;
	userEmail: string | null;
	orgName?: string | null;
	orgId?: string | null;
	body: string;
}

export interface SlackEmailFailureAlertInput {
	emailLogId: string;
	fromEmail: string;
	toEmails: string[];
	subject: string;
	errorMessage: string;
	orgName?: string | null;
	orgId?: string | null;
}

export interface SlackSigninAlertInput {
	email: string;
	fullName: string;
	userId?: string | null;
	isNewUser?: boolean;
	browser?: string | null;
	os?: string | null;
	ip?: string | null;
	location?: string | null;
}

export interface SlackAbuseAlertInput {
	organizationId: string;
	emailLogId?: string | null;
	fromEmail: string;
	subject: string;
	recipientCount: number;
	severity: "medium" | "high";
	reasons: string[];
	action: "blocked" | "allowed";
	orgName?: string | null;
}

export interface SlackDomainAddedAlertInput {
	domain: string;
	domainId: string;
	orgName?: string | null;
	orgId?: string | null;
	userName?: string | null;
	userEmail?: string | null;
	restored?: boolean;
}

// In-memory sliding window for email failure alert throttling
const EMAIL_FAILURE_WINDOW_MS = 60_000;
const MAX_EMAIL_FAILURE_ALERTS_PER_WINDOW = 5;
const emailFailureTimestamps: number[] = [];
let suppressedEmailFailuresCount = 0;

function cleanConsoleUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, "");
}

export function isSystemEmail(fromEmail: string): boolean {
	const lower = fromEmail.toLowerCase();
	return (
		lower.includes("mail.reloop.sh") ||
		lower.includes("reloop.email") ||
		lower.startsWith("auth@") ||
		lower.startsWith("security@") ||
		lower.startsWith("onboarding@")
	);
}

function escapeSlackText(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

export function buildSupportSlackPayload(
	input: SlackSupportAlertInput,
	consoleBaseUrl = adminConfig.CONSOLE_BASE_URL,
) {
	const base = cleanConsoleUrl(consoleBaseUrl);
	const threadUrl = `${base}/console/support?c=${encodeURIComponent(input.conversationId)}`;
	const displayName = input.userName || "Customer";
	const displayEmail = input.userEmail || "No email";
	const displayOrg = input.orgName
		? `${input.orgName}${input.orgId ? ` (${input.orgId})` : ""}`
		: input.orgId || "Personal";

	const snippet =
		input.body.length > 500 ? `${input.body.slice(0, 497)}...` : input.body;

	return {
		text: `💬 Support message from ${displayName} (${displayEmail}): ${snippet}`,
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "💬 New Customer Support Message",
					emoji: true,
				},
			},
			{
				type: "section",
				fields: [
					{
						type: "mrkdwn",
						text: `*User:*\n${escapeSlackText(displayName)} (<mailto:${escapeSlackText(displayEmail)}|${escapeSlackText(displayEmail)}>)`,
					},
					{
						type: "mrkdwn",
						text: `*Organization:*\n${escapeSlackText(displayOrg)}`,
					},
				],
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `*Message:*\n> ${escapeSlackText(snippet).replace(/\n/g, "\n> ")}`,
				},
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Open Support Desk ↗",
							emoji: true,
						},
						url: threadUrl,
						style: "primary",
					},
				],
			},
		],
	};
}

export function buildEmailFailureSlackPayload(
	input: SlackEmailFailureAlertInput,
	consoleBaseUrl = adminConfig.CONSOLE_BASE_URL,
) {
	const base = cleanConsoleUrl(consoleBaseUrl);
	const targetEmail = input.toEmails[0] || "";
	const consoleEmailsUrl = targetEmail
		? `${base}/console/emails?q=${encodeURIComponent(targetEmail)}`
		: `${base}/console/emails?status=failed`;

	const isSystem = isSystemEmail(input.fromEmail);
	const severity = isSystem
		? "🚨 P0 - SYSTEM EMAIL FAILURE"
		: "⚠️ EMAIL DELIVERY FAILURE";
	const recipients = input.toEmails.join(", ") || "Unknown recipient";

	const errorSnippet =
		input.errorMessage.length > 500
			? `${input.errorMessage.slice(0, 497)}...`
			: input.errorMessage;

	const orgText = input.orgName
		? `${input.orgName}${input.orgId ? ` (${input.orgId})` : ""}`
		: input.orgId || "System / Platform";

	return {
		text: `${severity}: From ${input.fromEmail} to ${recipients} - ${input.subject || "(No Subject)"}`,
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: severity,
					emoji: true,
				},
			},
			{
				type: "section",
				fields: [
					{
						type: "mrkdwn",
						text: `*From:*\n\`${escapeSlackText(input.fromEmail)}\``,
					},
					{
						type: "mrkdwn",
						text: `*To:*\n\`${escapeSlackText(recipients)}\``,
					},
					{
						type: "mrkdwn",
						text: `*Subject:*\n${escapeSlackText(input.subject || "(No Subject)")}`,
					},
					{
						type: "mrkdwn",
						text: `*Org:*\n${escapeSlackText(orgText)}`,
					},
				],
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `*Error:*\n\`\`\`${escapeSlackText(errorSnippet)}\`\`\``,
				},
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Inspect in Console ↗",
							emoji: true,
						},
						url: consoleEmailsUrl,
						style: isSystem ? "danger" : "primary",
					},
				],
			},
		],
	};
}

export function buildSigninSlackPayload(
	input: SlackSigninAlertInput,
	consoleBaseUrl = adminConfig.CONSOLE_BASE_URL,
) {
	const base = cleanConsoleUrl(consoleBaseUrl);
	const displayName = input.fullName || "User";
	const displayEmail = input.email || "No email";
	const isNewUser = Boolean(input.isNewUser);
	const header = isNewUser ? "👋 New user signed in" : "🔑 User signed in";
	const userUrl = input.userId
		? `${base}/console/users/${encodeURIComponent(input.userId)}`
		: `${base}/console/users?q=${encodeURIComponent(displayEmail)}`;

	const fields: Array<{ type: "mrkdwn"; text: string }> = [
		{
			type: "mrkdwn",
			text: `*User:*\n${escapeSlackText(displayName)} (<mailto:${escapeSlackText(displayEmail)}|${escapeSlackText(displayEmail)}>)`,
		},
	];

	if (input.browser) {
		fields.push({
			type: "mrkdwn",
			text: `*Browser:*\n${escapeSlackText(input.browser)}`,
		});
	}
	if (input.os) {
		fields.push({
			type: "mrkdwn",
			text: `*OS:*\n${escapeSlackText(input.os)}`,
		});
	}
	if (input.ip) {
		fields.push({
			type: "mrkdwn",
			text: `*IP:*\n\`${escapeSlackText(input.ip)}\``,
		});
	}
	if (input.location) {
		fields.push({
			type: "mrkdwn",
			text: `*Location:*\n${escapeSlackText(input.location)}`,
		});
	}

	return {
		text: `${header}: ${displayName} (${displayEmail})`,
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: header,
					emoji: true,
				},
			},
			{
				type: "section",
				fields,
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Open in Console ↗",
							emoji: true,
						},
						url: userUrl,
						style: "primary",
					},
				],
			},
		],
	};
}

export function buildDomainAddedSlackPayload(
	input: SlackDomainAddedAlertInput,
	consoleBaseUrl = adminConfig.CONSOLE_BASE_URL,
) {
	const base = cleanConsoleUrl(consoleBaseUrl);
	const restored = Boolean(input.restored);
	const header = restored ? "🌐 Domain restored" : "🌐 Domain added";
	const displayOrg = input.orgName
		? `${input.orgName}${input.orgId ? ` (${input.orgId})` : ""}`
		: input.orgId || "Unknown organization";
	const addedBy =
		input.userName || input.userEmail
			? `${input.userName || "User"}${input.userEmail ? ` (${input.userEmail})` : ""}`
			: null;
	const domainUrl = `${base}/console/domains?q=${encodeURIComponent(input.domain)}`;
	const orgUrl = input.orgId
		? `${base}/console/organizations/${encodeURIComponent(input.orgId)}`
		: null;

	const fields: Array<{ type: "mrkdwn"; text: string }> = [
		{
			type: "mrkdwn",
			text: `*Domain:*\n\`${escapeSlackText(input.domain)}\``,
		},
		{
			type: "mrkdwn",
			text: `*Organization:*\n${escapeSlackText(displayOrg)}`,
		},
	];

	if (addedBy) {
		fields.push({
			type: "mrkdwn",
			text: `*Added by:*\n${escapeSlackText(addedBy)}`,
		});
	}

	const actions: Array<{
		type: "button";
		text: { type: "plain_text"; text: string; emoji: boolean };
		url: string;
		style: "primary";
	}> = [
		{
			type: "button",
			text: {
				type: "plain_text",
				text: "Open domain ↗",
				emoji: true,
			},
			url: domainUrl,
			style: "primary",
		},
	];

	if (orgUrl) {
		actions.push({
			type: "button",
			text: {
				type: "plain_text",
				text: "Open organization ↗",
				emoji: true,
			},
			url: orgUrl,
			style: "primary",
		});
	}

	return {
		text: `${header}: ${input.domain} (${displayOrg})`,
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: header,
					emoji: true,
				},
			},
			{
				type: "section",
				fields,
			},
			{
				type: "actions",
				elements: actions,
			},
		],
	};
}

export function buildAbuseSlackPayload(
	input: SlackAbuseAlertInput,
	consoleBaseUrl = adminConfig.CONSOLE_BASE_URL,
) {
	const base = cleanConsoleUrl(consoleBaseUrl);
	const blocked = input.action === "blocked";
	const header = blocked
		? "Blocked suspected scam send"
		: "Review suspected scam send";
	const displayOrg = input.orgName
		? `${input.orgName} (${input.organizationId})`
		: input.organizationId;
	const emailsUrl = input.emailLogId
		? `${base}/console/emails?emailId=${encodeURIComponent(input.emailLogId)}`
		: `${base}/console/emails`;
	const orgUrl = `${base}/console/organizations/${encodeURIComponent(input.organizationId)}`;
	const reasons = input.reasons.length > 0 ? input.reasons.join(", ") : "n/a";

	return {
		text: `${header}: ${input.fromEmail} (${displayOrg})`,
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: header,
					emoji: true,
				},
			},
			{
				type: "section",
				fields: [
					{
						type: "mrkdwn",
						text: `*From:*\n${escapeSlackText(input.fromEmail)}`,
					},
					{
						type: "mrkdwn",
						text: `*Organization:*\n${escapeSlackText(displayOrg)}`,
					},
					{
						type: "mrkdwn",
						text: `*Subject:*\n${escapeSlackText(input.subject || "(none)")}`,
					},
					{
						type: "mrkdwn",
						text: `*Recipients:*\n${input.recipientCount}`,
					},
					{
						type: "mrkdwn",
						text: `*Severity:*\n${input.severity} / ${input.action}`,
					},
					{
						type: "mrkdwn",
						text: `*Signals:*\n${escapeSlackText(reasons)}`,
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Open email ↗",
							emoji: true,
						},
						url: emailsUrl,
						style: "primary",
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Open organization ↗",
							emoji: true,
						},
						url: orgUrl,
						style: "primary",
					},
				],
			},
		],
	};
}

export type SlackFetcher = (
	url: string,
	init?: RequestInit,
) => Promise<Response>;

export interface SlackNotificationOptions {
	webhookUrl?: string;
	consoleBaseUrl?: string;
	fetcher?: SlackFetcher;
}

async function postToSlack(
	url: string,
	payload: unknown,
	fetcher: SlackFetcher = fetch,
): Promise<boolean> {
	if (!url) return false;

	try {
		const response = await fetcher(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const body = await response.text().catch(() => "");
			log.error({
				status: response.status,
				body,
				message: "Slack webhook POST returned non-2xx status",
			});
			return false;
		}

		return true;
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to post message to Slack webhook",
		});
		return false;
	}
}

export function shouldThrottleEmailFailure(
	fromEmail: string,
	now = Date.now(),
): boolean {
	// Never throttle critical system emails (e.g. auth OTPs, security alerts, onboarding)
	if (isSystemEmail(fromEmail)) {
		return false;
	}

	// Evict timestamps older than 60s
	while (emailFailureTimestamps.length > 0) {
		const oldest = emailFailureTimestamps[0];
		if (oldest !== undefined && now - oldest > EMAIL_FAILURE_WINDOW_MS) {
			emailFailureTimestamps.shift();
		} else {
			break;
		}
	}

	if (emailFailureTimestamps.length >= MAX_EMAIL_FAILURE_ALERTS_PER_WINDOW) {
		suppressedEmailFailuresCount++;
		return true;
	}

	emailFailureTimestamps.push(now);
	return false;
}

export function resetEmailFailureThrottleForTesting() {
	emailFailureTimestamps.length = 0;
	suppressedEmailFailuresCount = 0;
}

export async function sendSlackSupportNotification(
	input: SlackSupportAlertInput,
	options: SlackNotificationOptions = {},
): Promise<boolean> {
	const webhookUrl =
		options.webhookUrl ??
		(adminConfig.SLACK_SUPPORT_WEBHOOK_URL || adminConfig.SLACK_WEBHOOK_URL);

	if (!webhookUrl) {
		log.debug({
			conversationId: input.conversationId,
			message: "Slack support webhook not configured, skipping notification",
		});
		return false;
	}

	const payload = buildSupportSlackPayload(
		input,
		options.consoleBaseUrl ?? adminConfig.CONSOLE_BASE_URL,
	);
	return await postToSlack(webhookUrl, payload, options.fetcher);
}

export async function sendSlackEmailFailureNotification(
	input: SlackEmailFailureAlertInput,
	options: SlackNotificationOptions = {},
): Promise<boolean> {
	const webhookUrl =
		options.webhookUrl ??
		(adminConfig.SLACK_ALERTS_WEBHOOK_URL || adminConfig.SLACK_WEBHOOK_URL);

	if (!webhookUrl) {
		log.debug({
			emailLogId: input.emailLogId,
			message: "Slack alerts webhook not configured, skipping notification",
		});
		return false;
	}

	if (shouldThrottleEmailFailure(input.fromEmail)) {
		log.warn({
			emailLogId: input.emailLogId,
			fromEmail: input.fromEmail,
			suppressedTotal: suppressedEmailFailuresCount,
			message: "Email failure Slack alert throttled due to high frequency",
		});
		return false;
	}

	const payload = buildEmailFailureSlackPayload(
		input,
		options.consoleBaseUrl ?? adminConfig.CONSOLE_BASE_URL,
	);
	return await postToSlack(webhookUrl, payload, options.fetcher);
}

export async function sendSlackSigninNotification(
	input: SlackSigninAlertInput,
	options: SlackNotificationOptions = {},
): Promise<boolean> {
	const webhookUrl = options.webhookUrl ?? adminConfig.SLACK_WEBHOOK_URL;

	if (!webhookUrl) {
		log.debug({
			email: input.email,
			message: "Slack webhook not configured, skipping sign-in notification",
		});
		return false;
	}

	const payload = buildSigninSlackPayload(
		input,
		options.consoleBaseUrl ?? adminConfig.CONSOLE_BASE_URL,
	);
	return await postToSlack(webhookUrl, payload, options.fetcher);
}

export async function sendSlackDomainAddedNotification(
	input: SlackDomainAddedAlertInput,
	options: SlackNotificationOptions = {},
): Promise<boolean> {
	const webhookUrl = options.webhookUrl ?? adminConfig.SLACK_WEBHOOK_URL;

	if (!webhookUrl) {
		log.debug({
			domain: input.domain,
			domainId: input.domainId,
			message:
				"Slack webhook not configured, skipping domain-added notification",
		});
		return false;
	}

	const payload = buildDomainAddedSlackPayload(
		input,
		options.consoleBaseUrl ?? adminConfig.CONSOLE_BASE_URL,
	);
	return await postToSlack(webhookUrl, payload, options.fetcher);
}

export async function sendSlackAbuseNotification(
	input: SlackAbuseAlertInput,
	options: SlackNotificationOptions = {},
): Promise<boolean> {
	const webhookUrl =
		options.webhookUrl ??
		(adminConfig.SLACK_ALERTS_WEBHOOK_URL || adminConfig.SLACK_WEBHOOK_URL);

	if (!webhookUrl) {
		log.debug({
			organizationId: input.organizationId,
			message:
				"Slack alerts webhook not configured, skipping abuse notification",
		});
		return false;
	}

	const payload = buildAbuseSlackPayload(
		input,
		options.consoleBaseUrl ?? adminConfig.CONSOLE_BASE_URL,
	);
	return await postToSlack(webhookUrl, payload, options.fetcher);
}
