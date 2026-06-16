import { domainConfig } from "@reloop/domain/domain.config";
import { DNSTypes } from "@reloop/domain/types/dns.type";
import { generateDKIMKeyPair } from "@reloop/domain/utils/dkim-key-generator";
import {
	getDomainHost,
	getDomainSubString,
} from "@reloop/domain/utils/domain-formatter";

export async function generateDKIMRecord(
	domain: string,
	rootDomain: string,
): Promise<DNSTypes.DNSRecord> {
	const dkimKeyPair = await generateDKIMKeyPair();
	const cleanPublicKey = dkimKeyPair.publicKey
		.replace(/-----BEGIN PUBLIC KEY-----/, "")
		.replace(/-----END PUBLIC KEY-----/, "")
		.replace(/\s/g, "");

	const dkimValue = `v=DKIM1; k=rsa; p=${cleanPublicKey}`;
	const name = `${domainConfig.DKIM_SELECTOR}._domainkey.${domain}`;

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name,
		fqdn: `${name}.${rootDomain}`,
		value: dkimValue,
		ttl: "Auto",
		privateKey: dkimKeyPair.privateKey,
	};
}

export function generateSPFRecord(
	domain: string,
	rootDomain: string,
): DNSTypes.DNSRecord {
	const spfValue = `v=spf1 include:${domainConfig.HOST_DOMAIN} -all`;

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name: domain,
		fqdn: `${domain}.${rootDomain}`,
		value: spfValue,
		ttl: "Auto",
	};
}

export function generateDMARCRecord(
	domain: string,
	rootDomain: string,
): DNSTypes.DNSRecord {
	const dmarcValue = "v=DMARC1; p=reject;";
	const name = `_dmarc.${domain}`;

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name,
		fqdn: `${name}.${rootDomain}`,
		value: dmarcValue,
		ttl: "Auto",
	};
}

export function generateMXRecord(
	domain: string,
	rootDomain: string,
	host?: string,
): DNSTypes.DNSRecord {
	return {
		type: DNSTypes.DNSRecordType.MX,
		name: domain,
		fqdn: `${domain}.${rootDomain}`,
		value: host || domainConfig.HOST_DOMAIN,
		priority: domainConfig.constants.mxPriority,
		ttl: "Auto",
	};
}

export function generateReceivingMXRecord(
	hostDomain: string,
	rootDomain: string,
	customReturnPath: string,
): DNSTypes.DNSRecord {
	return generateMXRecord(customReturnPath, rootDomain, hostDomain);
}

export async function generateAllDNSRecords(domain: string): Promise<{
	mxRecord: DNSTypes.DNSRecord;
	spfRecord: DNSTypes.DNSRecord;
	dmarcRecord: DNSTypes.DNSRecord;
	dkimRecord: DNSTypes.DNSRecord;
}> {
	const domainSubString = getDomainSubString(domain);
	const domainHost = getDomainHost(domain);
	const dkimRecord = await generateDKIMRecord(domainSubString, domainHost);
	const spfRecord = generateSPFRecord(domainSubString, domainHost);
	const dmarcRecord = generateDMARCRecord(domainSubString, domainHost);
	const mxRecord = generateMXRecord(domainSubString, domainHost);
	return {
		mxRecord,
		spfRecord,
		dmarcRecord,
		dkimRecord,
	};
}

export function generateTrackingCNAMERecord(
	trackingSubdomain: string,
	rootDomain: string,
): DNSTypes.DNSRecord {
	return {
		type: DNSTypes.DNSRecordType.CNAME,
		name: trackingSubdomain,
		fqdn: `${trackingSubdomain}.${rootDomain}`,
		value: domainConfig.TRACKING_DOMAIN,
		ttl: "Auto",
	};
}
