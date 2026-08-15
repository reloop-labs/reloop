export type SignalStatus = "pass" | "fail" | "warn" | "neutral";

export type Verdict = "invalid" | "disposable" | "risky" | "deliverable";

export type InputKind = "email" | "domain";

export type DisposableMatch =
	| { kind: "exact"; domain: string }
	| { kind: "wildcard"; domain: string; pattern: string };

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

export type EvaluationResult = {
	input: string;
	kind: InputKind | null;
	localPart: string | null;
	domain: string | null;
	unicodeDomain: string | null;

	verdict: Verdict;

	isValidSyntax: boolean;
	syntaxFailure: SyntaxFailure | null;

	isDisposable: boolean;
	disposableMatch: DisposableMatch | null;
	isAllowlisted: boolean;

	isRoleAddress: boolean;
	isFreeProvider: boolean;

	signals: {
		syntax: SignalStatus;
		disposable: SignalStatus;
		role: SignalStatus;
		freeProvider: SignalStatus;
	};
};
