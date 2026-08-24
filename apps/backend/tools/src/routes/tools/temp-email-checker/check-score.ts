import type { DisposableMatch } from "@reloop/email-validation";

export const CHECK_FLAGS = [
	"INVALID_SYNTAX",
	"DISPOSABLE_DOMAIN",
	"WILDCARD_DISPOSABLE",
	"PUBLIC_INBOX_DETECTED",
	"ROLE_BASED_PREFIX",
	"FREE_PROVIDER",
	"ALLOWLISTED",
	"NO_MX_RECORDS",
] as const;

export type CheckFlag = (typeof CHECK_FLAGS)[number];

export type MxStatus = "ok" | "empty" | "error" | "skipped";

export type CheckScoringInput = {
	isValidSyntax: boolean;
	isDisposable: boolean;
	disposableMatch: DisposableMatch | null;
	isAllowlisted: boolean;
	isRoleAddress: boolean;
	isFreeProvider: boolean;
	mxStatus: MxStatus;
};

export type CheckScore = {
	confidence: number;
	riskScore: number;
	flags: CheckFlag[];
};

export function scoreCheck(input: CheckScoringInput): CheckScore {
	return {
		...scoresFor(input),
		flags: collectFlags(input),
	};
}

function collectFlags(input: CheckScoringInput): CheckFlag[] {
	const flags: CheckFlag[] = [];

	if (!input.isValidSyntax) flags.push("INVALID_SYNTAX");
	if (input.isDisposable) flags.push("DISPOSABLE_DOMAIN");
	if (input.disposableMatch?.kind === "wildcard") {
		flags.push("WILDCARD_DISPOSABLE");
	}
	if (input.isDisposable) flags.push("PUBLIC_INBOX_DETECTED");
	if (input.isRoleAddress) flags.push("ROLE_BASED_PREFIX");
	if (input.isFreeProvider) flags.push("FREE_PROVIDER");
	if (input.isAllowlisted) flags.push("ALLOWLISTED");
	if (input.mxStatus === "empty") flags.push("NO_MX_RECORDS");

	return flags;
}

function scoresFor(
	input: CheckScoringInput,
): Pick<CheckScore, "confidence" | "riskScore"> {
	if (!input.isValidSyntax) {
		return { confidence: 1, riskScore: 1 };
	}

	if (input.isDisposable) {
		const wildcard = input.disposableMatch?.kind === "wildcard";
		return {
			confidence: wildcard ? 0.92 : 0.98,
			riskScore: wildcard ? 0.9 : 0.94,
		};
	}

	if (input.isRoleAddress) {
		return {
			confidence: 0.85,
			riskScore: input.mxStatus === "empty" ? 0.55 : 0.45,
		};
	}

	if (input.isAllowlisted) {
		return {
			confidence: 0.95,
			riskScore: input.mxStatus === "empty" ? 0.22 : 0.08,
		};
	}

	if (input.mxStatus === "empty") {
		return { confidence: 0.7, riskScore: 0.38 };
	}

	if (input.isFreeProvider) {
		return { confidence: 0.96, riskScore: 0.12 };
	}

	return { confidence: 0.99, riskScore: 0.02 };
}
