import { ValidationErrors } from "@be/validation/error/validation.error-response";
import type { ValidationModel } from "@be/validation/model/validation.model";
import { validationConfig } from "@be/validation/validation.config";
import { evaluate } from "@reloop/email-validation";

export function checkEmailController(
	input: string,
): ValidationModel.CheckResponse {
	const trimmed = input.trim();

	if (trimmed.length === 0) throw ValidationErrors.emptyInput();
	if (trimmed.length > validationConfig.constants.maxInputLength) {
		throw ValidationErrors.inputTooLong();
	}

	const result = evaluate(trimmed);

	return {
		input: result.input,
		kind: result.kind,
		domain: result.domain,
		unicodeDomain: result.unicodeDomain,
		verdict: result.verdict,
		isValidSyntax: result.isValidSyntax,
		syntaxFailure: result.syntaxFailure,
		isDisposable: result.isDisposable,
		disposableMatch: result.disposableMatch
			? {
					kind: result.disposableMatch.kind,
					domain: result.disposableMatch.domain,
					...(result.disposableMatch.kind === "wildcard"
						? { pattern: result.disposableMatch.pattern }
						: {}),
				}
			: null,
		isAllowlisted: result.isAllowlisted,
		isRoleAddress: result.isRoleAddress,
		isFreeProvider: result.isFreeProvider,
		signals: result.signals,
	};
}
