import { postToolsJson } from "@reloop/web/lib/landing/tools/tools-api";

export type DkimGenerateResponse = {
	domain: string;
	selector: string;
	dnsName: string;
	record: string;
	publicKey: string;
	privateKey: string;
	keyType: "rsa";
	bits: 2048;
};

export function generateDkimRecord(
	body: { domain: string; selector?: string },
	signal?: AbortSignal,
) {
	return postToolsJson<DkimGenerateResponse>(
		"/api/tools/v1/dkim-generate",
		body,
		signal,
	);
}
