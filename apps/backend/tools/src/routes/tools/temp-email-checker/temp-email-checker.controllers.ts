import { ToolsErrors } from "@be/tools/error/tools.error-response";
import type { ToolsModel } from "@be/tools/model/tools.model";
import { toolsConfig } from "@be/tools/tools.config";
import { evaluate } from "@reloop/email-validation";
import { scoreCheck } from "./check-score";
import { type DnsblLookupResult, lookupDnsbl } from "./dnsbl-lookup";
import {
	inspectMxInfrastructure,
	lookupMxRecords,
	type MxInspection,
	type MxLookupResult,
} from "./mx-lookup";

export type TempEmailCheckerDeps = {
	lookupMx?: (domain: string) => Promise<MxLookupResult>;
	lookupDnsbl?: (domain: string) => Promise<DnsblLookupResult>;
	inspectMx?: (mxHosts: string[]) => Promise<MxInspection>;
};

export async function tempEmailCheckerController(
	input: string,
	deps: TempEmailCheckerDeps = {},
): Promise<ToolsModel.CheckResponse> {
	const trimmed = input.trim();

	if (trimmed.length === 0) throw ToolsErrors.emptyInput();
	if (trimmed.length > toolsConfig.constants.maxInputLength) {
		throw ToolsErrors.inputTooLong();
	}

	const result = evaluate(trimmed);
	const lookupMx = deps.lookupMx ?? lookupMxRecords;
	const checkDnsbl = deps.lookupDnsbl ?? lookupDnsbl;
	const checkMxInfra = deps.inspectMx ?? inspectMxInfrastructure;

	const needsDnsbl =
		result.domain !== null && !result.isDisposable && !result.isAllowlisted;

	const [mx, dnsbl] = await Promise.all([
		result.domain === null
			? Promise.resolve({ status: "skipped" as const, records: [] as [] })
			: lookupMx(result.domain),
		needsDnsbl && result.domain !== null
			? checkDnsbl(result.domain)
			: Promise.resolve({ listed: false, records: [] }),
	]);

	let isDisposable = result.isDisposable || dnsbl.listed;
	let disposableMatch =
		result.disposableMatch ??
		(dnsbl.listed && result.domain !== null
			? { kind: "exact" as const, domain: result.domain }
			: null);

	if (
		!isDisposable &&
		!result.isAllowlisted &&
		mx.status === "ok" &&
		mx.records.length > 0
	) {
		const mxInspection = await checkMxInfra(mx.records);
		if (mxInspection.isDisposableMx && result.domain !== null) {
			isDisposable = true;
			disposableMatch = { kind: "exact" as const, domain: result.domain };
		}
	}

	const signals = {
		...result.signals,
		disposable: isDisposable ? ("fail" as const) : result.signals.disposable,
	};

	const score = scoreCheck({
		isValidSyntax: result.isValidSyntax,
		isDisposable,
		disposableMatch,
		isAllowlisted: result.isAllowlisted,
		isRoleAddress: result.isRoleAddress,
		isFreeProvider: result.isFreeProvider,
		mxStatus: mx.status,
	});

	const baseVerdict = isDisposable ? "disposable" : result.verdict;
	const verdict =
		mx.status === "empty" && !isDisposable ? "invalid" : baseVerdict;

	return {
		input: result.input,
		kind: result.kind,
		domain: result.domain,
		unicodeDomain: result.unicodeDomain,
		verdict,
		isValidSyntax: result.isValidSyntax,
		syntaxFailure: result.syntaxFailure,
		isDisposable,
		disposableMatch: disposableMatch
			? {
					kind: disposableMatch.kind,
					domain: disposableMatch.domain,
					...(disposableMatch.kind === "wildcard"
						? { pattern: disposableMatch.pattern }
						: {}),
				}
			: null,
		isAllowlisted: result.isAllowlisted,
		isRoleAddress: result.isRoleAddress,
		isFreeProvider: result.isFreeProvider,
		signals,
		mxRecords: mx.records,
		confidence: score.confidence,
		riskScore: score.riskScore,
		flags: score.flags,
	};
}
