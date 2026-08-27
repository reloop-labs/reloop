import { postToolsJson } from "@reloop/web/lib/landing/tools/tools-api";

export type DmarcPolicy = "none" | "quarantine" | "reject";
export type DmarcAlignment = "r" | "s";

export type RecordWarning = {
	severity: "warn" | "fail";
	code: string;
	detail: string;
	fix: string;
};

export type DmarcGenerateResponse = {
	domain: string;
	dnsName: string;
	record: string;
	policy: DmarcPolicy;
	warnings: RecordWarning[];
};

export type DmarcGenerateBody = {
	domain: string;
	policy?: DmarcPolicy;
	rua?: string;
	ruf?: string;
	aspf?: DmarcAlignment;
	adkim?: DmarcAlignment;
	pct?: number;
	sp?: DmarcPolicy;
};

export function generateDmarcRecord(
	body: DmarcGenerateBody,
	signal?: AbortSignal,
) {
	return postToolsJson<DmarcGenerateResponse>(
		"/api/tools/v1/dmarc-generate",
		body,
		signal,
	);
}
