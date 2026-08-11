import { isFreeProvider, isRoleLocalPart, matchDisposable } from "./catalogue";
import { parseInput, stripPlusTag } from "./normalize";
import { validateDomain, validateLocalPart } from "./syntax";
import type { EvaluationResult, SyntaxFailure } from "./types";

function invalid(
	input: string,
	failure: SyntaxFailure,
	partial?: Partial<EvaluationResult>,
): EvaluationResult {
	return {
		input,
		kind: null,
		localPart: null,
		domain: null,
		unicodeDomain: null,
		verdict: "invalid",
		isValidSyntax: false,
		syntaxFailure: failure,
		isDisposable: false,
		disposableMatch: null,
		isAllowlisted: false,
		isRoleAddress: false,
		isFreeProvider: false,
		signals: {
			syntax: "fail",
			disposable: "neutral",
			role: "neutral",
			freeProvider: "neutral",
		},
		...partial,
	};
}

export function evaluate(raw: string): EvaluationResult {
	const parsed = parseInput(raw);

	if (!parsed.ok) {
		return invalid(parsed.normalizedInput, parsed.failure);
	}

	const { kind, normalizedInput, localPart, domain, unicodeDomain } = parsed;

	if (localPart !== null) {
		const localFailure = validateLocalPart(localPart);
		if (localFailure) return invalid(normalizedInput, localFailure);
	}

	const domainFailure = validateDomain(domain);
	if (domainFailure) return invalid(normalizedInput, domainFailure);

	const { match, allowlisted } = matchDisposable(domain);
	const disposable = match !== null;
	const freeProvider = isFreeProvider(domain);
	const roleAddress =
		localPart !== null && isRoleLocalPart(stripPlusTag(localPart));

	const verdict = disposable
		? "disposable"
		: roleAddress
			? "risky"
			: "deliverable";

	return {
		input: normalizedInput,
		kind,
		localPart,
		domain,
		unicodeDomain,
		verdict,
		isValidSyntax: true,
		syntaxFailure: null,
		isDisposable: disposable,
		disposableMatch: match,
		isAllowlisted: allowlisted,
		isRoleAddress: roleAddress,
		isFreeProvider: freeProvider,
		signals: {
			syntax: "pass",
			disposable: disposable ? "fail" : "pass",
			role: roleAddress ? "warn" : "pass",
			freeProvider: freeProvider ? "neutral" : "pass",
		},
	};
}
