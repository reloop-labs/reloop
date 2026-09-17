import { recipientDomain } from "./mailbox-provider";

export type OutboundAbuseSeverity = "none" | "medium" | "high";

export type OutboundAbuseScore = {
	severity: OutboundAbuseSeverity;
	reasons: string[];
	phishingTokenCount: number;
};

const SMS_GATEWAY_DOMAINS = new Set([
	"mms.mb.telus.com",
	"msg.telus.com",
	"sms.telus.com",
	"txt.att.net",
	"mms.att.net",
	"vtext.com",
	"vzwpix.com",
	"tmomail.net",
	"messaging.sprintpcs.com",
	"pm.sprint.com",
	"sms.mycricket.com",
	"mms.cricketwireless.net",
	"email.uscc.net",
	"mms.uscc.net",
	"sms.rogers.com",
	"pcs.rogers.com",
	"sms.fido.ca",
	"fido.ca",
	"vmobile.ca",
	"txt.bell.ca",
	"sms.sasktel.com",
	"myboostmobile.com",
	"sms.myboostmobile.com",
]);

const PHISHING_TOKEN_RES: Array<{ re: RegExp; id: string }> = [
	{ re: /\bcve-\d/i, id: "cve" },
	{ re: /\bcrypto\b/i, id: "crypto" },
	{ re: /\bwallet\b/i, id: "wallet" },
	{ re: /non-custodial/i, id: "non_custodial" },
	{ re: /seed phrase/i, id: "seed_phrase" },
	{ re: /private key/i, id: "private_key" },
	{ re: /connect your wallet/i, id: "connect_wallet" },
	{ re: /51k\+?\s*losses/i, id: "loss_lure" },
];

const URL_RE = /https?:\/\/[^\s"'<>)\]]+/i;
const PHONE_LOCAL_PART_RE = /^\d{10,15}$/;

function asRecipients(to: string | string[] | undefined): string[] {
	if (!to) return [];
	return (Array.isArray(to) ? to : [to]).map((s) => s.trim()).filter(Boolean);
}

export function isSmsGatewayAddress(raw: string): boolean {
	const domain = recipientDomain(raw);
	if (domain && SMS_GATEWAY_DOMAINS.has(domain)) return true;
	const local = raw.split("@")[0]?.replace(/^.*</, "").trim() ?? "";
	return PHONE_LOCAL_PART_RE.test(local) && Boolean(domain);
}

export function countPhishingTokens(text: string): {
	count: number;
	ids: string[];
} {
	const ids: string[] = [];
	for (const { re, id } of PHISHING_TOKEN_RES) {
		if (re.test(text)) ids.push(id);
	}
	return { count: ids.length, ids };
}

/**
 * Score a send for operator review / automatic block.
 * High = a real customer never does this (carrier SMS gateways, stacked phishing lure).
 * Medium = worth a Slack ping, still deliver.
 * None = leave the user on the normal plan cap.
 */
export function scoreOutboundAbuse(args: {
	from?: string;
	to?: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	subject?: string;
	text?: string;
	html?: string;
}): OutboundAbuseScore {
	const recipients = [
		...asRecipients(args.to),
		...asRecipients(args.cc),
		...asRecipients(args.bcc),
	];
	const reasons: string[] = [];
	const body = `${args.from ?? ""} ${args.subject ?? ""} ${args.text ?? ""} ${args.html ?? ""}`;
	const phishing = countPhishingTokens(body);
	const gatewayHits = recipients.filter(isSmsGatewayAddress);

	if (gatewayHits.length > 0) {
		reasons.push("sms_gateway");
	}
	if (phishing.count > 0) {
		reasons.push(...phishing.ids.map((id) => `phish:${id}`));
	}

	if (gatewayHits.length > 0 || phishing.count >= 3) {
		return {
			severity: "high",
			reasons,
			phishingTokenCount: phishing.count,
		};
	}

	const hasUrl = URL_RE.test(body);
	if (phishing.count >= 1 && hasUrl) {
		return {
			severity: "medium",
			reasons,
			phishingTokenCount: phishing.count,
		};
	}
	if (recipients.length >= 25) {
		return {
			severity: "medium",
			reasons: [...reasons, "bulk_recipients"],
			phishingTokenCount: phishing.count,
		};
	}

	return { severity: "none", reasons: [], phishingTokenCount: phishing.count };
}
