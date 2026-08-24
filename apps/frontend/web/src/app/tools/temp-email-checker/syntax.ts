export type SyntaxFailure =
	| "empty"
	| "no-domain"
	| "multiple-at"
	| "local-part-empty"
	| "local-part-too-long"
	| "local-part-invalid"
	| "domain-too-long"
	| "domain-invalid"
	| "domain-single-label"
	| "domain-label-empty"
	| "domain-label-too-long"
	| "domain-label-hyphen"
	| "tld-invalid";

export const SYNTAX_DETAIL: Record<SyntaxFailure, string> = {
	empty: "Enter an email or a domain to check.",
	"no-domain": "Nothing after the @ — the domain is missing.",
	"multiple-at": "An address can only contain one @.",
	"local-part-empty": "Nothing before the @ — the mailbox name is missing.",
	"local-part-too-long": "The part before the @ is longer than 64 characters.",
	"local-part-invalid":
		"The part before the @ contains a stray dot or an illegal character.",
	"domain-too-long": "The domain is longer than 253 characters.",
	"domain-invalid": "The domain contains characters that cannot appear in one.",
	"domain-single-label": "Missing a top-level domain, such as .com.",
	"domain-label-empty":
		"The domain has an empty part — check for a double dot.",
	"domain-label-too-long":
		"One part of the domain is longer than 63 characters.",
	"domain-label-hyphen": "A part of the domain starts or ends with a hyphen.",
	"tld-invalid": "The ending does not look like a real top-level domain.",
};

const FALLBACK_DETAIL = "Does not parse as an email address or a domain.";

export const FIELD_ERROR_MESSAGE = "Invalid email or domain.";

const MAX_LOCAL_PART = 64;
const MAX_DOMAIN = 253;
const MAX_LABEL = 63;

const DOT_ATOM_CHAR = /^[a-z0-9!#$%&'*+\-/=?^_`{|}~]+$/;
const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const IDN_LABEL = /^(?:[\p{L}\p{N}])(?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u;
const TLD = /^(?:[a-z]{2,}|xn--[a-z0-9-]{2,}|[\p{L}]{2,})$/u;

function clean(raw: string): string {
	let value = raw.trim();

	if (/^mailto:/i.test(value)) value = value.slice("mailto:".length).trim();

	if (value.startsWith("<") && value.endsWith(">")) {
		value = value.slice(1, -1).trim();
	}

	return value.toLowerCase();
}

function validateLocalPart(localPart: string): SyntaxFailure | null {
	if (localPart.length === 0) return "local-part-empty";
	if (localPart.length > MAX_LOCAL_PART) return "local-part-too-long";

	if (localPart.startsWith(".") || localPart.endsWith(".")) {
		return "local-part-invalid";
	}
	if (localPart.includes("..")) return "local-part-invalid";

	for (const atom of localPart.split(".")) {
		if (!DOT_ATOM_CHAR.test(atom)) return "local-part-invalid";
	}

	return null;
}

function validateDomain(domain: string): SyntaxFailure | null {
	if (domain.length > MAX_DOMAIN) return "domain-too-long";
	if (/[/:?#\s]/.test(domain)) return "domain-invalid";

	const labels = domain.split(".");
	if (labels.length < 2) return "domain-single-label";

	for (const label of labels) {
		if (label.length === 0) return "domain-label-empty";
		if (label.length > MAX_LABEL) return "domain-label-too-long";
		if (label.startsWith("-") || label.endsWith("-")) {
			return "domain-label-hyphen";
		}
		if (!DOMAIN_LABEL.test(label) && !IDN_LABEL.test(label)) {
			return "domain-invalid";
		}
	}

	const tld = labels[labels.length - 1];
	if (!tld || !TLD.test(tld)) return "tld-invalid";

	return null;
}

export function syntaxMessage(failure: string | null | undefined): string {
	if (failure && failure in SYNTAX_DETAIL) {
		return SYNTAX_DETAIL[failure as SyntaxFailure];
	}
	return FALLBACK_DETAIL;
}

export type CheckerInputValidity =
	| { ok: true }
	| { ok: false; failure: SyntaxFailure; message: string };

export function validateCheckerInput(raw: string): CheckerInputValidity {
	const normalizedInput = clean(raw);

	if (normalizedInput.length === 0) {
		return {
			ok: false,
			failure: "empty",
			message: SYNTAX_DETAIL.empty,
		};
	}

	const atIndex = normalizedInput.lastIndexOf("@");
	const isEmail = atIndex !== -1;

	const localPart = isEmail ? normalizedInput.slice(0, atIndex) : null;
	const rawDomain = isEmail
		? normalizedInput.slice(atIndex + 1)
		: normalizedInput;

	if (isEmail) {
		if (localPart === "") {
			return fail("local-part-empty");
		}
		if (localPart?.includes("@")) {
			return fail("multiple-at");
		}
		if (rawDomain === "") {
			return fail("no-domain");
		}
	}

	const domain = rawDomain.endsWith(".") ? rawDomain.slice(0, -1) : rawDomain;

	if (domain === "") {
		return fail("domain-invalid");
	}

	if (localPart !== null) {
		const localFailure = validateLocalPart(localPart);
		if (localFailure) return fail(localFailure);
	}

	const domainFailure = validateDomain(domain);
	if (domainFailure) return fail(domainFailure);

	return { ok: true };
}

function fail(failure: SyntaxFailure): CheckerInputValidity {
	return { ok: false, failure, message: SYNTAX_DETAIL[failure] };
}
