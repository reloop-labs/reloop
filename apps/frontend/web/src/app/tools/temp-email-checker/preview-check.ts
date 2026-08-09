/**
 * UI PREVIEW ONLY — this is not the checker.
 *
 * It exists so the panel's visual states (valid / disposable / role / free /
 * invalid) can be exercised in the browser while the real check is still
 * unbuilt. The sets below are a handful of well-known domains, not the real
 * catalogue, and the whole module is client-side.
 *
 * When the real check lands, delete this file and replace the single call in
 * `checker-panel.tsx` with a request to the route handler. `CheckResult` is the
 * shape the route handler should return, so nothing else in the UI changes.
 */

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

const PREVIEW_DISPOSABLE_DOMAINS = new Set([
	"10minutemail.com",
	"guerrillamail.com",
	"mailinator.com",
	"maildrop.cc",
	"sharklasers.com",
	"temp-mail.org",
	"tempmail.com",
	"throwawaymail.com",
	"trashmail.com",
	"yopmail.com",
]);

const PREVIEW_FREE_PROVIDERS = new Set([
	"aol.com",
	"gmail.com",
	"hotmail.com",
	"icloud.com",
	"outlook.com",
	"proton.me",
	"protonmail.com",
	"yahoo.com",
]);

const ROLE_LOCAL_PARTS = new Set([
	"admin",
	"billing",
	"contact",
	"help",
	"hello",
	"info",
	"noreply",
	"no-reply",
	"office",
	"postmaster",
	"sales",
	"support",
	"webmaster",
]);

/** Deliberately permissive — the real check owns strict RFC 5322 parsing. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const DOMAIN_SHAPE = /^[^\s@.]+(?:\.[^\s@.]+)+$/;

function signal(
	id: string,
	label: string,
	status: SignalStatus,
	detail: string,
): CheckSignal {
	return { id, label, status, detail };
}

export function previewCheck(raw: string): CheckResult {
	const input = raw.trim().toLowerCase();

	const isEmail = EMAIL_SHAPE.test(input);
	const isBareDomain = !input.includes("@") && DOMAIN_SHAPE.test(input);

	if (!isEmail && !isBareDomain) {
		return {
			input: raw.trim(),
			domain: null,
			verdict: "invalid",
			headline: "Not a valid address",
			summary:
				"This isn't a well-formed email address or domain, so there's nothing to look up. Check for a missing @, a missing top-level domain, or a stray space.",
			signals: [
				signal(
					"syntax",
					"Address syntax",
					"fail",
					"Does not parse as an email address or a domain",
				),
			],
		};
	}

	const localPart = isEmail ? input.slice(0, input.lastIndexOf("@")) : null;
	const domain = isEmail ? input.slice(input.lastIndexOf("@") + 1) : input;

	const isDisposable = PREVIEW_DISPOSABLE_DOMAINS.has(domain);
	const isFreeProvider = PREVIEW_FREE_PROVIDERS.has(domain);
	const isRole = localPart !== null && ROLE_LOCAL_PARTS.has(localPart);

	const signals: CheckSignal[] = [
		signal(
			"syntax",
			"Address syntax",
			"pass",
			isEmail ? "Well-formed email address" : "Well-formed domain",
		),
		signal(
			"disposable",
			"Disposable domain",
			isDisposable ? "fail" : "pass",
			isDisposable
				? `${domain} is a known throwaway mailbox provider`
				: "Not on the known disposable list",
		),
		signal(
			"role",
			"Role address",
			isRole ? "warn" : "pass",
			localPart === null
				? "No local part to inspect — domain checked on its own"
				: isRole
					? `"${localPart}@" is a shared team inbox, not a person`
					: "Addressed to an individual, not a shared inbox",
		),
		signal(
			"free",
			"Free provider",
			isFreeProvider ? "neutral" : "pass",
			isFreeProvider
				? `${domain} is a consumer mailbox — real, but not a company domain`
				: "Not a consumer mailbox provider",
		),
	];

	if (isDisposable) {
		return {
			input: raw.trim(),
			domain,
			verdict: "disposable",
			headline: "Disposable address",
			summary:
				"This domain hands out temporary mailboxes that expire on their own. Sending here will hard-bounce once the inbox is gone, and those bounces count against your sending domain.",
			signals,
		};
	}

	if (isRole) {
		return {
			input: raw.trim(),
			domain,
			verdict: "risky",
			headline: "Real, but shared",
			summary:
				"Nothing suggests this is a throwaway address, but it points at a shared team inbox rather than a person. Expect lower engagement and a higher chance of complaints on marketing sends.",
			signals,
		};
	}

	return {
		input: raw.trim(),
		domain,
		verdict: "deliverable",
		headline: "No disposable signals",
		summary: isFreeProvider
			? "This is a consumer mailbox from a mainstream provider — free to create, but persistent and real. Safe to send to unless your product requires a company domain."
			: "This domain isn't on the known disposable list and shows no throwaway signals. Safe to accept.",
		signals,
	};
}
