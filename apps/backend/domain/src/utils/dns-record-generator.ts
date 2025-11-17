import { domainConfig } from "@be/domain/domain.config";
import { DNSTypes } from "@be/domain/types/dns.type";
import { generateDKIMKeyPair } from "./dkim-key-generator";

export async function generateDKIMRecord(
	domain: string,
): Promise<DNSTypes.DNSRecord> {
	const dkimKeyPair = await generateDKIMKeyPair();
	const cleanPublicKey = dkimKeyPair.publicKey
		.replace(/-----BEGIN PUBLIC KEY-----/, "")
		.replace(/-----END PUBLIC KEY-----/, "")
		.replace(/\s/g, "");

	const dkimValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name: `${domainConfig.DKIM_SELECTOR}._domainkey.${domain}`,
		value: dkimValue,
		ttl: 3600,
		privateKey: dkimKeyPair.privateKey,
	};
}

export function generateSPFRecord(domain: string): DNSTypes.DNSRecord {
	const spfValue = `v=spf1 include:${domainConfig.HOST_DOMAIN} ~all`;

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name: domain,
		value: spfValue,
		ttl: 3600,
	};
}

export function generateDMARCRecord(domain: string): DNSTypes.DNSRecord {
	const dmarcValue = "v=DMARC1; p=none;";

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name: `_dmarc.${domain}`,
		value: dmarcValue,
		ttl: 3600,
	};
}

export function generateMXRecord(domain: string): DNSTypes.DNSRecord {
	return {
		type: DNSTypes.DNSRecordType.MX,
		name: domain,
		value: domainConfig.HOST_DOMAIN,
		priority: domainConfig.constants.mxPriority,
		ttl: 3600,
	};
}

export async function generateAllDNSRecords(domain: string): Promise<{
	mxRecord: DNSTypes.DNSRecord;
	spfRecord: DNSTypes.DNSRecord;
	dmarcRecord: DNSTypes.DNSRecord;
	dkimRecord: DNSTypes.DNSRecord;
}> {
	const domainSubString = getDomainString(domain);
	const dkimRecord = await generateDKIMRecord(domainSubString);
	const spfRecord = generateSPFRecord(domainSubString);
	const dmarcRecord = generateDMARCRecord(domainSubString);
	const mxRecord = generateMXRecord(domainSubString);
	return {
		mxRecord,
		spfRecord,
		dmarcRecord,
		dkimRecord,
	};
}

const getDomainString = (domain: string) => {
	if (domain.split(".").length >= 3) {
		const subDomain = domain.split(".").slice(0, -2).join(".");
		return `send.${subDomain}`;
	}
	return "send";
};
