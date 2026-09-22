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
	if (!api.isValidSyntax) return { confidence: 1, riskScore: 1 };
	if (api.isDisposable) return { confidence: 0.999, riskScore: 0.94 };
	if (typeof api.confidence === "number" && typeof api.riskScore === "number") {
		return { confidence: api.confidence, riskScore: api.riskScore };
	}
	if (api.isRoleAddress) return { confidence: 0.85, riskScore: 0.45 };
	return { confidence: 0.99, riskScore: 0.02 };
}

function resolveVerdict(
	apiVerdict: CheckVerdict,
	flags: readonly ApiCheckFlag[],
): CheckVerdict {
	if (apiVerdict === "disposable") return "disposable";
	if (hasFlag(flags, "NO_MX_RECORDS")) return "invalid";
	return apiVerdict;
}

export function toPublicPayload(api: ApiCheckResponse): PublicCheckPayload {
	const flags = inferredFlags(api);
	const scores = inferredScores(api);
	const verdict = resolveVerdict(api.verdict, flags);

	const confidence =
		verdict === "invalid"
			? 1
			: verdict === "disposable" || api.isDisposable
				? 0.999
				: scores.confidence;
	const riskScore = verdict === "invalid" ? 1 : scores.riskScore;

	return {
		input: api.input,
		domain: api.domain,
		verdict,
		isDisposable: api.isDisposable,
		mxRecords: Array.isArray(api.mxRecords) ? api.mxRecords : [],
		confidence,
		riskScore,
		flags,
	};
}

function confidenceLabel(
	verdict: CheckVerdict,
	confidence: number,
	_flags?: readonly ApiCheckFlag[],
): string {
	if (verdict === "invalid" || confidence === 1) return "100% confidence";
	if (verdict === "disposable" || confidence === 0.999)
		return "99.9% confidence";

	const pct = confidence * 100;
	const formatted = Number.isInteger(pct)
		? `${pct}`
		: `${Number.parseFloat(pct.toFixed(1))}`;
	return `${formatted}% confidence`;
}

function displaySignals(
	api: ApiCheckResponse,
	flags: readonly ApiCheckFlag[],
): DisplaySignal[] {
	if (!api.isValidSyntax) {
		return [
			{ label: "MX record", value: "---", status: "neutral" },
			{ label: "Disposable provider", value: "---", status: "neutral" },
			{ label: "Role prefix", value: "---", status: "neutral" },
			{ label: "Email syntax", value: "Malformed", status: "fail" },
		];
	}

	const disposable = hasFlag(flags, "DISPOSABLE_DOMAIN");
	const role = hasFlag(flags, "ROLE_BASED_PREFIX");
	const noMx = hasFlag(flags, "NO_MX_RECORDS");
	const mxUnknown =
		!noMx && (!Array.isArray(api.mxRecords) || api.mxRecords.length === 0);
	const isAddress = api.kind === "email";

	if (noMx) {
		return [
			{
				label: "MX record",
				value: "Not found",
				status: "fail",
			},
			{ label: "Disposable provider", value: "---", status: "neutral" },
			{ label: "Role prefix", value: "---", status: "neutral" },
			{ label: "Email syntax", value: "---", status: "neutral" },
		];
	}

	if (disposable) {
		return [
			{
				label: "MX record",
				value: mxUnknown ? "Unknown" : "Found",
				status: mxUnknown ? "neutral" : "pass",
			},
			{
				label: "Disposable provider",
				value: "Yes",
				status: "fail",
			},
			{ label: "Role prefix", value: "---", status: "neutral" },
			{ label: "Email syntax", value: "---", status: "neutral" },
		];
	}

	return [
		{
			label: "MX record",
			value: mxUnknown ? "Unknown" : "Found",
			status: mxUnknown ? "neutral" : "pass",
		},
		{
			label: "Disposable provider",
			value: "No",
			status: "pass",
		},
		{
			label: "Role prefix",
			value: !isAddress ? "No local-part" : role ? "Shared" : "None",
			status: !isAddress ? "neutral" : role ? "warn" : "pass",
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
			subtitle: "Failed syntax check",
			summary: `${detail}. Catalogue and MX lookups were skipped.`,
			recommendation: "Ask for a real email or domain and check it again.",
			recommendationTone: "neutral",
		};
	}

	if (api.isDisposable) {
		return {
			headline: "Known disposable provider",
			subtitle: "On the throwaway-domain list",
			summary:
				"This domain is in the disposable catalogue. Providers like it hand out short-lived mailboxes, so later sends often hard-bounce. We did not probe the mailbox itself.",
			recommendation:
				"Treat this as a throwaway address. Block it at signup if you need a durable identity.",
			recommendationTone: "fail",
		};
	}

	if (api.isRoleAddress) {
		return {
			headline: "Shared role inbox",
			subtitle: "Role-based local-part",
			summary:
				"The domain is not on the disposable list, but the local-part is a shared prefix such as billing@ or support@. That is a team inbox, not a person. We did not probe the mailbox itself.",
			recommendation:
				"Accept it only if a shared inbox is fine. If you need a single owner, ask for a personal address.",
			recommendationTone: "warn",
		};
	}

	const noMx = hasFlag(flags, "NO_MX_RECORDS");
	const mxUnknown =
		!noMx && (!Array.isArray(api.mxRecords) || api.mxRecords.length === 0);
	const domain = api.domain ?? "this domain";

	if (noMx) {
		return {
			headline: "No MX records found",
			subtitle: "No MX records published",
			summary: `${domain} is not on the disposable list, but DNS returned no MX records. Mail cannot be routed to a domain with no exchanger. ${DELIVERY_LIMIT}`,
			recommendation:
				"This address cannot receive email because the domain has no MX records.",
			recommendationTone: "fail",
		};
	}

	if (mxUnknown) {
		return {
			headline: "No disposable match",
			subtitle: "MX lookup did not return hosts",
			summary: `${domain} is not on the disposable list. MX lookup did not return hosts, so mail routing is unconfirmed. ${DELIVERY_LIMIT}`,
			recommendation:
				"No throwaway match. Retry the check before you treat MX as present or missing.",
			recommendationTone: "warn",
		};
	}

	return {
		headline: "No disposable match",
		subtitle: api.isFreeProvider
			? "Consumer mailbox provider"
			: "Not on the disposable list",
		summary: api.isFreeProvider
			? `${domain} is a consumer mailbox provider, not a company domain, and it is not on the disposable list. MX records were found. ${DELIVERY_LIMIT}`
			: `Not on the known disposable list, and the domain published MX records. ${DELIVERY_LIMIT}`,
		recommendation:
			"No throwaway match, and MX records exist for the domain. That is not proof the mailbox exists.",
		recommendationTone: "pass",
	};
}

export function toCheckResult(api: ApiCheckResponse): CheckResult {
	const rawJson = toPublicPayload(api);
	const copy = copyFor(api, rawJson.flags);

	return {
		input: api.input,
		domain: api.domain,
		verdict: rawJson.verdict,
		...copy,
		confidenceLabel: confidenceLabel(
			rawJson.verdict,
			rawJson.confidence,
			rawJson.flags,
		),
		displaySignals: displaySignals(api, rawJson.flags),
		rawJson,
	};
}
