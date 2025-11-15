import { domainConfig } from "@be/domain/domain.config";
import type { DNSTypes } from "@be/domain/routes/dns/dns.type";

export function generateDKIMRecord(
	domain: string,
	publicKey: string,
): DNSTypes.DNSRecord {
	const cleanPublicKey = publicKey
		.replace(/-----BEGIN PUBLIC KEY-----/, "")
		.replace(/-----END PUBLIC KEY-----/, "")
		.replace(/\s/g, "");

	const dkimValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;

	return {
		type: "TXT",
		name: `${domainConfig.DKIM_SELECTOR}._domainkey.${domain}`,
		value: dkimValue,
		ttl: 3600,
		description: "DKIM public key for email authentication",
	};
}

export function generateSPFRecord(domain: string): DNSTypes.DNSRecord {
	const spfValue = `v=spf1 include:${domainConfig.HOST_DOMAIN} ~all`;

	return {
		type: "TXT",
		name: domain,
		value: spfValue,
		ttl: 3600,
		description: "SPF record for email authentication",
	};
}

export function generateDMARCRecord(domain: string): DNSTypes.DNSRecord {
	const dmarcValue = "v=DMARC1; p=none;";

	return {
		type: "TXT",
		name: `_dmarc.${domain}`,
		value: dmarcValue,
		ttl: 3600,
		description: "DMARC policy for email authentication",
	};
}

export function generateMXRecord(domain: string): DNSTypes.DNSRecord {
	return {
		type: "MX",
		name: domain,
		value: domainConfig.HOST_DOMAIN,
		priority: domainConfig.constants.mxPriority,
		ttl: 3600,
		description: "Mail exchange record",
	};
}

export function generateAllDNSRecords(domain: string): DNSTypes.DNSRecord[] {
	return [
		generateMXRecord(domain),
		generateSPFRecord(domain),
		generateDMARCRecord(domain),
	];
}
