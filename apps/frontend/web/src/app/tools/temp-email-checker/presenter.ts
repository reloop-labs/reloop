import type { ApiCheckFlag, ApiCheckResponse, ApiVerdict } from "./check-api";
import { syntaxMessage } from "./syntax";

export type SignalStatus = "pass" | "fail" | "warn" | "neutral";

export type DisplaySignal = {
	label: string;
	value: string;
	status: SignalStatus;
};

export type CheckVerdict = ApiVerdict;

export type RecommendationTone = "fail" | "warn" | "pass" | "neutral";

export type PublicCheckPayload = {
	input: string;
	domain: string | null;
	verdict: CheckVerdict;
	isDisposable: boolean;
	mxRecords: string[];
	confidence: number;
	riskScore: number;
	flags: ApiCheckFlag[];
};

export type CheckResult = {
	input: string;
	domain: string | null;
	verdict: CheckVerdict;
	headline: string;
	subtitle: string;
	summary: string;
	recommendation: string;
	recommendationTone: RecommendationTone;
	confidenceLabel: string;
	displaySignals: DisplaySignal[];
	rawJson: PublicCheckPayload;
};

const DELIVERY_LIMIT =
	"Nothing here confirms the mailbox exists or that mail would be delivered.";

function hasFlag(flags: readonly ApiCheckFlag[], flag: ApiCheckFlag): boolean {
	return flags.includes(flag);
}

function inferredFlags(api: ApiCheckResponse): ApiCheckFlag[] {
	if (Array.isArray(api.flags)) return api.flags;

	const flags: ApiCheckFlag[] = [];
	if (!api.isValidSyntax) flags.push("INVALID_SYNTAX");
	if (api.isDisposable) flags.push("DISPOSABLE_DOMAIN");
	if (api.disposableMatch?.kind === "wildcard") {
		flags.push("WILDCARD_DISPOSABLE");
	}
	if (api.isDisposable) flags.push("PUBLIC_INBOX_DETECTED");
	if (api.isRoleAddress) flags.push("ROLE_BASED_PREFIX");
	if (api.isFreeProvider) flags.push("FREE_PROVIDER");
	if (api.isAllowlisted) flags.push("ALLOWLISTED");
	return flags;
}

function inferredScores(api: ApiCheckResponse): {
	confidence: number;
	riskScore: number;
} {
	if (typeof api.confidence === "number" && typeof api.riskScore === "number") {
		return { confidence: api.confidence, riskScore: api.riskScore };
	}
	if (!api.isValidSyntax) return { confidence: 1, riskScore: 1 };
	if (api.isDisposable) return { confidence: 0.98, riskScore: 0.94 };
	if (api.isRoleAddress) return { confidence: 0.85, riskScore: 0.45 };
	return { confidence: 0.99, riskScore: 0.02 };
}

export function toPublicPayload(api: ApiCheckResponse): PublicCheckPayload {
	const flags = inferredFlags(api);
	const scores = inferredScores(api);

	return {
		input: api.input,
		domain: api.domain,
		verdict: api.verdict,
		isDisposable: api.isDisposable,
		mxRecords: Array.isArray(api.mxRecords) ? api.mxRecords : [],
		confidence: scores.confidence,
		riskScore: scores.riskScore,
		flags,
	};
}

function confidenceLabel(verdict: CheckVerdict, confidence: number): string {
	if (verdict === "invalid") return "Syntax Error";
	return `${Math.round(confidence * 100)}% confidence`;
}

function displaySignals(
	api: ApiCheckResponse,
	flags: readonly ApiCheckFlag[],
): DisplaySignal[] {
	if (!api.isValidSyntax) {
		return [
			{
				label: "Disposable provider",
				value: "Skipped",
				status: "neutral",
			},
			{
				label: "Domain reputation",
				value: "Skipped",
				status: "neutral",
			},
			{
				label: "Mailbox pattern",
				value: "Skipped",
				status: "neutral",
			},
			{ label: "Email syntax", value: "Malformed", status: "fail" },
		];
	}

	const disposable = hasFlag(flags, "DISPOSABLE_DOMAIN");
	const role = hasFlag(flags, "ROLE_BASED_PREFIX");
	const noMx = hasFlag(flags, "NO_MX_RECORDS");

	return [
		{
			label: "Disposable provider",
			value: disposable ? "Detected" : "Clean",
			status: disposable ? "fail" : "pass",
		},
		{
			label: "Domain reputation",
			value: disposable ? "Suspicious" : noMx ? "No MX" : "Valid",
			status: disposable || noMx ? "warn" : "pass",
		},
		{
			label: "Mailbox pattern",
			value: disposable ? "Random / Burner" : role ? "Shared Role" : "Standard",
			status: disposable || role ? "warn" : "pass",
		},
		{ label: "Email syntax", value: "Valid", status: "pass" },
	];
}

function copyFor(
	api: ApiCheckResponse,
	flags: readonly ApiCheckFlag[],
): Pick<
	CheckResult,
	"headline" | "subtitle" | "summary" | "recommendation" | "recommendationTone"
> {
	if (!api.isValidSyntax) {
		const detail = syntaxMessage(api.syntaxFailure);
		return {
			headline: "Not a valid address",
			subtitle: "Malformed address or hostname",
			summary: `${detail}. Nothing was looked up, so there is no verdict to give — fix the address and check it again.`,
			recommendation:
				"Prompt the user to correct the syntax before accepting this submission.",
			recommendationTone: "neutral",
		};
	}

	if (api.isDisposable) {
		return {
			headline: "Disposable address",
			subtitle: "Disposable email",
			summary:
				"This domain is on the disposable list. Providers like it typically hand out mailboxes that are discarded within minutes or hours, so mail sent here risks bouncing, and bounces count against your sending domain.",
			recommendation:
				"Treat this address as disposable when verifying identity. Block from signups.",
			recommendationTone: "fail",
		};
	}

	if (api.isRoleAddress) {
		return {
			headline: "Real, but shared",
			subtitle: "Role-based or shared mailbox",
			summary:
				"Nothing suggests this is a throwaway address, but it points at a shared team inbox rather than a person. Expect lower engagement and a higher chance of complaints on marketing sends.",
			recommendation:
				"Accept with caution. Verify individual recipient identity if access control requires single-user ownership.",
			recommendationTone: "warn",
		};
	}

	const noMx = hasFlag(flags, "NO_MX_RECORDS");
	const domain = api.domain ?? "this domain";

	if (noMx) {
		return {
			headline: "No disposable signals",
			subtitle: "No mail exchanger records",
			summary: `${domain} is not on the disposable list, but it published no MX records. ${DELIVERY_LIMIT}`,
			recommendation:
				"No throwaway provider matched, but confirm the domain before you send — there are no MX records to deliver to.",
			recommendationTone: "warn",
		};
	}

	return {
		headline: "No disposable signals",
		subtitle: "Standard mailbox with valid records",
		summary: api.isFreeProvider
			? `${domain} is a mainstream consumer mailbox provider rather than a company domain, and it is not on the disposable list. ${DELIVERY_LIMIT}`
			: `This domain isn't on the known disposable list and shows no throwaway signals. ${DELIVERY_LIMIT}`,
		recommendation:
			"Safe to accept and send. Domain has valid MX records and no flags for disposable providers.",
		recommendationTone: "pass",
	};
}

export function toCheckResult(api: ApiCheckResponse): CheckResult {
	const rawJson = toPublicPayload(api);
	const copy = copyFor(api, rawJson.flags);

	return {
		input: api.input,
		domain: api.domain,
		verdict: api.verdict,
		...copy,
		confidenceLabel: confidenceLabel(api.verdict, rawJson.confidence),
		displaySignals: displaySignals(api, rawJson.flags),
		rawJson,
	};
}
