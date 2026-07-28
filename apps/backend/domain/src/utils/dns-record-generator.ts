import { domainConfig } from "@reloop/domain/domain.config";
import { DNSTypes } from "@reloop/domain/types/dns.type";
import { generateDKIMKeyPair } from "@reloop/domain/utils/dkim-key-generator";
import {
	getDomainHost,
	getDomainSubString,
	getReceivingMxName,
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
	const isApex = domain === "@";
	const name = isApex
		? `${domainConfig.DKIM_SELECTOR}._domainkey`
		: `${domainConfig.DKIM_SELECTOR}._domainkey.${domain}`;

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name,
		fqdn: isApex ? `${name}.${rootDomain}` : `${name}.${rootDomain}`,
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

	const isApex = domain === "@";

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name: isApex ? "@" : domain,
		fqdn: isApex ? rootDomain : `${domain}.${rootDomain}`,
		value: spfValue,
		ttl: "Auto",
	};
}

export function generateDMARCRecord(
	domain: string,
	rootDomain: string,
): DNSTypes.DNSRecord {
	const dmarcValue = "v=DMARC1; p=reject;";
	const isApex = domain === "@";
	const name = isApex ? "_dmarc" : `_dmarc.${domain}`;

	return {
		type: DNSTypes.DNSRecordType.TXT,
		name,
		fqdn: `${name}.${rootDomain}`,
		value: dmarcValue,
		ttl: "Auto",
	};
}

export function generateMXRecord(
	name: string,
	rootDomain: string,
	host?: string,
): DNSTypes.DNSRecord {
	const isApex =
		name === "@" ||
		name === "" ||
		name === rootDomain ||
		name.toLowerCase() === rootDomain.toLowerCase();
	const recordName = isApex ? "@" : name;
	// Apex MX must resolve the zone apex — never "@.example.com".
	const fqdn = isApex ? rootDomain : `${name}.${rootDomain}`;

	return {
		type: DNSTypes.DNSRecordType.MX,
		name: recordName,
		fqdn,
		value: host || domainConfig.HOST_DOMAIN,
		priority: domainConfig.constants.mxPriority,
		ttl: "Auto",
	};
}

/**
 * Receiving MX: mail for the customer's domain is delivered to the inbound MTA.
 * Name is the domain being verified (`@` for apex, relative label for subdomains).
 * Value is always `inbound.{HOST_DOMAIN}` (e.g. inbound.reloop.sh).
 */
export function generateReceivingMXRecord(
	hostDomain: string,
	rootDomain: string,
	receivingName: string,
): DNSTypes.DNSRecord {
	const inboundHost = `inbound.${hostDomain}`;
	return generateMXRecord(receivingName, rootDomain, inboundHost);
}

/** Convenience: build receiving MX for a full customer domain string. */
export function generateReceivingMXRecordForDomain(
	domain: string,
	hostDomain: string = domainConfig.HOST_DOMAIN,
): DNSTypes.DNSRecord {
	return generateReceivingMXRecord(
		hostDomain,
		getDomainHost(domain),
		getReceivingMxName(domain),
	);
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
