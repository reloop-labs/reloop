import type { HTTPClient } from "../client.js";
import type {
	CreateDomainRequest,
	DKIMKeysResponse,
	DNSRecordsResponse,
	DomainListResponse,
	DomainQuery,
	DomainResponse,
	GenerateDNSRecordsResponse,
	VerifyDNSRecordRequest,
	VerifyDNSRecordResponse,
} from "../types.js";

export class DomainService {
	constructor(private client: HTTPClient) {}

	/**
	 * Create a new domain
	 * @param data Domain creation data
	 * @returns Promise resolving to the created domain
	 */
	async create(data: CreateDomainRequest): Promise<DomainResponse> {
		return this.client.post<DomainResponse>("/api/domain/v1/add", data);
	}

	/**
	 * Get a domain by name
	 * @param domain Domain name
	 * @returns Promise resolving to the domain
	 */
	async get(domain: string): Promise<DomainResponse> {
		return this.client.get<DomainResponse>(
			`/api/domain/v1/${encodeURIComponent(domain)}`,
		);
	}

	/**
	 * List domains with optional filters
	 * @param query Query parameters for filtering and pagination
	 * @returns Promise resolving to the list of domains
	 */
	async list(query?: DomainQuery): Promise<DomainListResponse> {
		return this.client.get<DomainListResponse>("/api/domain/v1/list", query);
	}

	/**
	 * Delete a domain
	 * @param domain Domain name
	 * @returns Promise resolving to a success message
	 */
	async delete(domain: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`/api/domain/v1/${encodeURIComponent(domain)}`,
		);
	}

	/**
	 * Get DNS records for a domain
	 * @param domain Domain name
	 * @returns Promise resolving to DNS records
	 */
	async getDNSRecords(domain: string): Promise<DNSRecordsResponse> {
		return this.client.get<DNSRecordsResponse>(
			`/api/domain/v1/dns/${encodeURIComponent(domain)}`,
		);
	}

	/**
	 * Get DKIM keys for a domain
	 * @param domain Domain name
	 * @returns Promise resolving to DKIM keys
	 */
	async getDKIMKeys(domain: string): Promise<DKIMKeysResponse> {
		return this.client.get<DKIMKeysResponse>(
			`/api/domain/v1/dns/${encodeURIComponent(domain)}/dkim`,
		);
	}

	/**
	 * Verify a DNS record for a domain
	 * @param domain Domain name
	 * @param data DNS record verification data
	 * @returns Promise resolving to verification result
	 */
	async verifyDNSRecord(
		domain: string,
		data: VerifyDNSRecordRequest,
	): Promise<VerifyDNSRecordResponse> {
		return this.client.post<VerifyDNSRecordResponse>(
			`/api/domain/v1/dns/${encodeURIComponent(domain)}/verify`,
			data,
		);
	}

	/**
	 * Generate DNS records for a domain
	 * @param domain Domain name
	 * @param body Optional generation options
	 * @returns Promise resolving to generated DNS records
	 */
	async generateDNSRecords(
		domain: string,
		body?: Record<string, unknown>,
	): Promise<GenerateDNSRecordsResponse> {
		return this.client.post<GenerateDNSRecordsResponse>(
			`/api/domain/v1/dns/${encodeURIComponent(domain)}/generate`,
			body,
		);
	}

	/**
	 * Delete DNS records for a domain
	 * @param domain Domain name
	 * @returns Promise resolving to a success message
	 */
	async deleteDNSRecords(domain: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`/api/domain/v1/dns/${encodeURIComponent(domain)}`,
		);
	}
}
