import { postToolsJson } from "@reloop/web/lib/landing/tools/tools-api";

export type RecordWarning = {
	severity: "warn" | "fail";
	code: string;
	detail: string;
	fix: string;
};

export type SpfGenerateResponse = {
	domain: string;
	dnsName: string;
	record: string;
	lookupCount: number;
	lookupLimit: number;
	policy: "~all" | "-all" | "?all" | "+all";
	existingRecord: string | null;
	warnings: RecordWarning[];
};

export type SpfGenerateBody = {
	domain: string;
	ipv4?: string[];
	ipv6?: string[];
	includes?: string[];
	a?: boolean;
	mx?: boolean;
	policy?: SpfGenerateResponse["policy"];
};

export function generateSpfRecord(body: SpfGenerateBody, signal?: AbortSignal) {
	return postToolsJson<SpfGenerateResponse>(
		"/api/tools/v1/spf-generate",
		body,
		signal,
	);
}
