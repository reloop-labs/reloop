import type { DNSModel } from "@be/domain/model/dns.model";
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
	}
	export interface DNSRecord {
		type: DNSRecordType;
		name: string;
		value: string;
		ttl: string;
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
		ttl: string;
		priority?: number;
		description?: string;
		isVerified: boolean;
		status: DNSRecordStatus;
	}
}
