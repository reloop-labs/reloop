import { ToolsErrors } from "@be/tools/error/tools.error-response";
import type { ToolsModel } from "@be/tools/model/tools.model";
import { toolsConfig } from "@be/tools/tools.config";
import { evaluate } from "@reloop/email-validation";

export function checkEmailController(input: string): ToolsModel.CheckResponse {
	const trimmed = input.trim();

	if (trimmed.length === 0) throw ToolsErrors.emptyInput();
	if (trimmed.length > toolsConfig.constants.maxInputLength) {
		throw ToolsErrors.inputTooLong();
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
