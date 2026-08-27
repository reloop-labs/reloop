import { generateKeyPair } from "node:crypto";
import { promisify } from "node:util";
import { ToolsErrors } from "@be/tools/error/tools.error-response";
import {
	isPlausibleDomain,
	isPlausibleSelector,
	normalizeDomain,
} from "@be/tools/lib/domain";

const generateKeyPairAsync = promisify(generateKeyPair);

export type DkimGenerateInput = {
	domain: string;
	selector?: string;
};

export type DkimGenerateResult = {
	domain: string;
	selector: string;
	dnsName: string;
	record: string;
	publicKey: string;
	privateKey: string;
	keyType: "rsa";
	bits: 2048;
};

const DEFAULT_SELECTOR = "default";

export function pemToDkimPublicKey(pem: string): string {
	return pem
		.replace(/-----BEGIN PUBLIC KEY-----/g, "")
		.replace(/-----END PUBLIC KEY-----/g, "")
		.replace(/\s+/g, "");
}

export function buildDkimRecord(publicKey: string): string {
	return `v=DKIM1; k=rsa; p=${publicKey}`;
}

export function dkimDnsName(selector: string, domain: string): string {
	return `${selector}._domainkey.${domain}`;
}

export async function generateDkimRecord(
	input: DkimGenerateInput,
): Promise<DkimGenerateResult> {
	const domain = normalizeDomain(input.domain);
	if (!domain) throw ToolsErrors.generatorEmptyDomain();
	if (!isPlausibleDomain(domain)) throw ToolsErrors.generatorInvalidDomain();

	const selector = (input.selector || DEFAULT_SELECTOR).trim().toLowerCase();
	if (!isPlausibleSelector(selector)) {
		throw ToolsErrors.generatorInvalidSelector();
	}

	const { publicKey, privateKey } = await generateKeyPairAsync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
	});

	const cleanPublic = pemToDkimPublicKey(publicKey);

	return {
		domain,
		selector,
		dnsName: dkimDnsName(selector, domain),
		record: buildDkimRecord(cleanPublic),
		publicKey: cleanPublic,
		privateKey,
		keyType: "rsa",
		bits: 2048,
	};
}
