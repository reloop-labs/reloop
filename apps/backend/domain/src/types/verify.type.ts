import type { VerifyModel } from "@be/domain/model/verify.model";

export namespace VerifyTypes {
	export type DnsValidationBody = typeof VerifyModel.dnsVerifyBody.static;
	export type DnsValidationResponse =
		typeof VerifyModel.dnsVerifyResponse.static;
	export type DnsRecord = typeof VerifyModel.dnsRecord.static;
	export type DnsValidationError = typeof VerifyModel.dnsVerifyError.static;

	export interface DnsRecordData {
		type: string;
		name: string;
		value: string;
		ttl: number;
		priority?: number;
	}

	export interface DnsVerifyRequest {
		domain: string;
		recordTypes?: string[];
	}

	export interface DnsVerifyResult {
		domain: string;
		isValid: boolean;
		records: DnsRecordData[];
		missingRecords: string[];
		errors: string[];
		checkedAt: string;
	}
}
