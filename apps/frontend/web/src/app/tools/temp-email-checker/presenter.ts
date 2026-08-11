import type { ApiCheckResponse } from "./check-api";

export type SignalStatus = "pass" | "fail" | "warn" | "neutral";

export type CheckSignal = {
	id: string;
	label: string;
	status: SignalStatus;
	detail: string;
};

export type CheckVerdict = "disposable" | "risky" | "deliverable" | "invalid";

export type CheckResult = {
	input: string;
	domain: string | null;
	verdict: CheckVerdict;
	headline: string;
	summary: string;
	signals: CheckSignal[];
};

const SYNTAX_DETAIL: Record<string, string> = {
	empty: "There is nothing to check",
	"no-domain": "Nothing after the @ — the domain is missing",
	"multiple-at": "An address can only contain one @",
	"local-part-empty": "Nothing before the @ — the mailbox name is missing",
	"local-part-too-long": "The part before the @ is longer than 64 characters",
	"local-part-invalid":
		"The part before the @ contains a stray dot or an illegal character",
	"domain-too-long": "The domain is longer than 253 characters",
	"domain-invalid": "The domain contains characters that cannot appear in one",
	"domain-single-label": "Missing a top-level domain, such as .com",
	"domain-label-empty": "The domain has an empty part — check for a double dot",
	"domain-label-too-long":
		"One part of the domain is longer than 63 characters",
	"domain-label-hyphen": "A part of the domain starts or ends with a hyphen",
	"tld-invalid": "The ending does not look like a real top-level domain",
};

function signal(
	id: string,
	label: string,
	status: SignalStatus,
	detail: string,
): CheckSignal {
	return { id, label, status, detail };
}

function invalidResult(api: ApiCheckResponse): CheckResult {
	const detail =
		(api.syntaxFailure && SYNTAX_DETAIL[api.syntaxFailure]) ??
		"Does not parse as an email address or a domain";

	return {
		input: api.input,
		domain: null,
		verdict: "invalid",
		headline: "Not a valid address",
		summary: `${detail}. Nothing was looked up, so there is no verdict to give — fix the address and check it again.`,
		signals: [signal("syntax", "Address syntax", "fail", detail)],
	};
}

function disposableDetail(api: ApiCheckResponse): string {
	if (!api.disposableMatch) return "Not on the known disposable list";

	return api.disposableMatch.kind === "wildcard"
		? `Matches ${api.disposableMatch.pattern}, a family of throwaway subdomains`
		: `${api.disposableMatch.domain} is a known throwaway mailbox provider`;
}

export function toCheckResult(api: ApiCheckResponse): CheckResult {
	if (!api.isValidSyntax) return invalidResult(api);

	const domain = api.domain ?? "";
	const isAddress = api.kind === "email";

	const signals: CheckSignal[] = [
		signal(
			"syntax",
			"Address syntax",
			"pass",
			isAddress ? "Well-formed email address" : "Well-formed domain",
		),
		signal(
			"disposable",
			"Disposable domain",
			api.signals.disposable,
			disposableDetail(api),
		),
		signal(
			"role",
			"Role address",
			api.signals.role,
			!isAddress
				? "No mailbox name to inspect — the domain was checked on its own"
				: api.isRoleAddress
					? "This is a shared team inbox, not a person"
					: "Addressed to an individual, not a shared inbox",
		),
		signal(
			"free",
			"Free provider",
			api.signals.freeProvider,
			api.isFreeProvider
				? `${domain} is a consumer mailbox — real, but not a company domain`
				: "Not a consumer mailbox provider",
		),
	];

	if (api.isAllowlisted) {
		signals.push(
			signal(
				"allowlist",
				"Exception list",
				"pass",
				`${domain} is whitelisted — it shows up on public disposable lists but is not a throwaway provider`,
			),
		);
	}

	if (api.isDisposable) {
		return {
			input: api.input,
			domain,
			verdict: "disposable",
			headline: "Disposable address",
			summary:
				"This domain hands out temporary mailboxes that expire on their own. Sending here will hard-bounce once the inbox is gone, and those bounces count against your sending domain.",
			signals,
		};
	}

	if (api.isRoleAddress) {
		return {
			input: api.input,
			domain,
			verdict: "risky",
			headline: "Real, but shared",
			summary:
				"Nothing suggests this is a throwaway address, but it points at a shared team inbox rather than a person. Expect lower engagement and a higher chance of complaints on marketing sends.",
			signals,
		};
	}

	return {
		input: api.input,
		domain,
		verdict: "deliverable",
		headline: "No disposable signals",
		summary: api.isFreeProvider
			? "This is a consumer mailbox from a mainstream provider — free to create, but persistent and real. Safe to send to unless your product requires a company domain."
			: "This domain isn't on the known disposable list and shows no throwaway signals. Safe to accept.",
		signals,
	};
}
