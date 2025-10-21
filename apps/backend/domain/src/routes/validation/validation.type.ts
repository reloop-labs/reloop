import type { ValidationModel } from "@reloop/domain/routes/validation/validation.model";

export namespace ValidationTypes {
    export type DnsValidationBody = typeof ValidationModel.dnsValidationBody.static;
    export type DnsValidationResponse = typeof ValidationModel.dnsValidationResponse.static;
    export type DnsRecord = typeof ValidationModel.dnsRecord.static;
    export type DnsValidationError = typeof ValidationModel.dnsValidationError.static;

    export interface DnsRecordData {
        type: string;
        name: string;
        value: string;
        ttl: number;
        priority?: number;
    }

    export interface DnsValidationRequest {
        domain: string;
        recordTypes?: string[];
    }

    export interface DnsValidationResult {
        domain: string;
        isValid: boolean;
        records: DnsRecordData[];
        missingRecords: string[];
        errors: string[];
        checkedAt: string;
    }
}
