import type { SyntaxFailure } from "./types";

const MAX_LOCAL_PART = 64;
/** 253, not 255: RFC 5321 counts the length octets the wire format adds. */
const MAX_DOMAIN = 253;
const MAX_LABEL = 63;

const DOT_ATOM_CHAR = /^[a-z0-9!#$%&'*+\-/=?^_`{|}~]+$/;

const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const TLD = /^(?:[a-z]{2,}|xn--[a-z0-9-]{2,})$/;

export function validateLocalPart(localPart: string): SyntaxFailure | null {
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

export function validateDomain(domain: string): SyntaxFailure | null {
	if (domain.length > MAX_DOMAIN) return "domain-too-long";

	const labels = domain.split(".");
	if (labels.length < 2) return "domain-single-label";

	for (const label of labels) {
		if (label.length === 0) return "domain-label-empty";
		if (label.length > MAX_LABEL) return "domain-label-too-long";
		if (label.startsWith("-") || label.endsWith("-")) {
			return "domain-label-hyphen";
		}
		if (!DOMAIN_LABEL.test(label)) return "domain-invalid";
	}

	const tld = labels[labels.length - 1];
	if (!tld || !TLD.test(tld)) return "tld-invalid";

	return null;
}
