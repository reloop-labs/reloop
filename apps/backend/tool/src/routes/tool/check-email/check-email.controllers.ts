import { ToolErrors } from "@be/tool/error/tool.error-response";
import type { ToolModel } from "@be/tool/model/tool.model";
import { toolConfig } from "@be/tool/tool.config";
import { evaluate } from "@reloop/email-validation";

export function checkEmailController(input: string): ToolModel.CheckResponse {
	const trimmed = input.trim();

	if (trimmed.length === 0) throw ToolErrors.emptyInput();
	if (trimmed.length > toolConfig.constants.maxInputLength) {
		throw ToolErrors.inputTooLong();
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
