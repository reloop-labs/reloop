import { domainToASCII } from "node:url";
import type { InputKind, SyntaxFailure } from "./types";

export type ParsedInput =
	| {
			ok: true;
			kind: InputKind;
			normalizedInput: string;
			localPart: string | null;
			domain: string;
			unicodeDomain: string | null;
	  }
	| { ok: false; normalizedInput: string; failure: SyntaxFailure };

function clean(raw: string): string {
	let value = raw.trim();

	if (/^mailto:/i.test(value)) value = value.slice("mailto:".length).trim();

	if (value.startsWith("<") && value.endsWith(">")) {
		value = value.slice(1, -1).trim();
	}

	return value.toLowerCase();
}

export function parseInput(raw: string): ParsedInput {
	const normalizedInput = clean(raw);

	if (normalizedInput.length === 0) {
		return { ok: false, normalizedInput, failure: "empty" };
	}

	const atIndex = normalizedInput.lastIndexOf("@");
	const isEmail = atIndex !== -1;

	const localPart = isEmail ? normalizedInput.slice(0, atIndex) : null;
	const rawDomain = isEmail
		? normalizedInput.slice(atIndex + 1)
		: normalizedInput;

	if (isEmail) {
		if (localPart === "") {
			return { ok: false, normalizedInput, failure: "local-part-empty" };
		}
		if (localPart?.includes("@")) {
			return { ok: false, normalizedInput, failure: "multiple-at" };
		}
		if (rawDomain === "") {
			return { ok: false, normalizedInput, failure: "no-domain" };
		}
	}

	const withoutRootDot = rawDomain.endsWith(".")
		? rawDomain.slice(0, -1)
		: rawDomain;

	if (withoutRootDot === "") {
		return { ok: false, normalizedInput, failure: "domain-invalid" };
	}

	const ascii = domainToASCII(withoutRootDot);
	if (ascii === "") {
		return { ok: false, normalizedInput, failure: "domain-invalid" };
	}

	// Bun's `domainToUnicode` leaves A-labels encoded where Node decodes them,
	// so deriving this from `ascii` would yield punycode on one runtime.
	return {
		ok: true,
		kind: isEmail ? "email" : "domain",
		normalizedInput,
		localPart,
		domain: ascii,
		unicodeDomain: withoutRootDot !== ascii ? withoutRootDot : null,
	};
}

export function stripPlusTag(localPart: string): string {
	const plusIndex = localPart.indexOf("+");
	return plusIndex === -1 ? localPart : localPart.slice(0, plusIndex);
}
