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

// The check never contacts a mail server — no copy here may promise delivery.
const DELIVERY_LIMIT =
	"Nothing here confirms the mailbox exists or that mail would be delivered.";

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
				? `${domain} is a consumer mailbox provider, not a company domain`
				: "Not a known consumer mailbox provider",
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
				"This domain is on the disposable list. Providers like it typically hand out mailboxes that are discarded within minutes or hours, so mail sent here risks bouncing, and bounces count against your sending domain.",
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
			? `${domain} is a mainstream consumer mailbox provider rather than a company domain, and it is not on the disposable list. ${DELIVERY_LIMIT}`
			: `This domain isn't on the known disposable list and shows no throwaway signals. ${DELIVERY_LIMIT}`,
		signals,
	};
}
