import type { ApiCheckResponse } from "./check-api";
import { syntaxMessage } from "./syntax";

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
	const detail = syntaxMessage(api.syntaxFailure);

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
