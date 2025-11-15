import type { DNSModel } from "@be/domain/model/dns.model";
import type { dnsRecordTypeEnum } from "@reloop/db/schema";
export namespace DNSTypes {
	export type DNSRecordResponse = typeof DNSModel.dnsRecordResponse.static;
	export type DKIMKeysResponse = typeof DNSModel.dkimKeysResponse.static;
	export type GenerateDNSBody = typeof DNSModel.generateDNSBody.static;
	export type VerifyDNSBody = typeof DNSModel.verifyDNSBody.static;
	export type GenerateDNSResponse = typeof DNSModel.generateDNSResponse.static;
	export type VerifyDNSResponse = typeof DNSModel.verifyDNSResponse.static;
	export type DeleteDNSResponse = typeof DNSModel.deleteDNSResponse.static;
	export type DNSRecordsNotFound = typeof DNSModel.dnsRecordsNotFound.static;
	export type DKIMKeysNotFound = typeof DNSModel.dkimKeysNotFound.static;
	export type DNSRecordNotFound = typeof DNSModel.dnsRecordNotFound.static;
	export type Unauthorized = typeof DNSModel.unauthorized.static;

	export interface DKIMKeyPair {
		publicKey: string;
		privateKey: string;
	}

	export enum DNSRecordType {
		A = "A",
		AAAA = "AAAA",
		CNAME = "CNAME",
		MX = "MX",
		TXT = "TXT",
		NS = "NS",
		SRV = "SRV",
		CAA = "CAA",
		SPF = "SPF",
		DKIM = "DKIM",
		DMARC = "DMARC",
	}
	export interface DNSRecord {
		type: DNSRecordType;
		name: string;
		value: string;
		ttl?: number;
		priority?: number;
		privateKey?: string;
	}

	export type DNSRecordStatus =
		| "start-verify"
		| "verifying"
		| "active"
		| "suspended"
		| "failed";

	export interface DNSRecordData {
		recordType: string;
		name: string;
		value: string;
		ttl: number;
		priority?: number;
		description?: string;
		isVerified: boolean;
		status: DNSRecordStatus;
	}
}
