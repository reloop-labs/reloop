import { ToolsErrors } from "@be/tools/error/tools.error-response";
import {
	checkDomainReputation,
	isValidDomain,
	normalizeDomain,
} from "./domain-reputation.service";

export async function checkDomainReputationController(rawDomain?: string) {
	const domain = normalizeDomain(rawDomain || "");

	if (!domain) {
		throw ToolsErrors.domainReputationEmptyInput();
	}

	if (!isValidDomain(domain)) {
		throw ToolsErrors.domainReputationInvalidDomain();
	}

	return await checkDomainReputation(domain);
}
