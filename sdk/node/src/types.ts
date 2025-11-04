/**
 * Type definitions for Reloop SDK
 */

// Mail Service Types
export interface SendEmailRequest {
	from: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	replyTo?: string;
	cc?: string | string[];
	bcc?: string | string[];
}

export interface SendEmailResponse {
	success: boolean;
	messageId: string;
	status: string;
	timestamp: string;
}

// Domain Service Types
export interface CreateDomainRequest {
	domain: string;
}

export type DomainStatus =
	| "start-verify"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export type DomainType = "custom" | "subdomain" | "system";

export type DNSRecordType =
	| "A"
	| "AAAA"
	| "CNAME"
	| "MX"
	| "TXT"
	| "NS"
	| "SRV"
	| "CAA"
	| "SPF"
	| "DKIM"
	| "DMARC";

export interface DNSRecord {
	id: string;
	recordType: DNSRecordType;
	name: string;
	value: string;
	ttl: number;
	priority: number | null;
	weight: number | null;
	port: number | null;
	description: string | null;
	isVerified: boolean;
	verificationError: string | null;
	isActive: boolean;
	createdAt: string;
	status: DomainStatus;
	updatedAt: string;
}

export interface DomainResponse {
	id: string;
	domain: string;
	organizationId: string;
	userId: string;
	domainType: DomainType;
	status: DomainStatus;
	userVerified: boolean;
	systemVerified: boolean;
	dnsConfigured: boolean;
	nameservers: string[] | null;
	spfRecord: string | null;
	dkimRecord: string | null;
	dkimSelector: string;
	dmarcRecord: string | null;
	dmarcPolicy: string;
	trackingDomain: boolean;
	verificationFailedReason: string | null;
	dnsRecords: DNSRecord[];
	deletedAt: string | null;
	lastVerifiedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface DomainListResponse {
	domains: DomainResponse[];
	total: number;
	page: number;
	limit: number;
}

export interface DomainQuery extends Record<string, unknown> {
	page?: number;
	limit?: number;
	status?: DomainStatus;
	organizationId?: string;
	userId?: string;
}

export interface DNSRecordsResponse {
	records: DNSRecord[];
}

export interface DKIMKeysResponse {
	publicKey: string;
	privateKey: string;
	selector: string;
}

export interface VerifyDNSRecordRequest {
	recordType: DNSRecordType;
	name: string;
	value: string;
}

export interface VerifyDNSRecordResponse {
	verified: boolean;
	message?: string;
}

export interface GenerateDNSRecordsResponse {
	records: DNSRecord[];
}

// Webhook Service Types
export type WebhookStatus = "active" | "paused" | "disabled" | "failed";

export interface CreateWebhookRequest {
	name: string;
	url: string;
	secret?: string;
	customHeaders?: Record<string, string>;
	rateLimitEnabled?: boolean;
	maxRequestsPerMinute?: number;
	maxRetries?: number;
	retryBackoffMultiplier?: number;
	filteringOptions?: Record<string, unknown>;
}

export interface UpdateWebhookRequest {
	name?: string;
	url?: string;
	secret?: string;
	status?: WebhookStatus;
	customHeaders?: Record<string, string>;
	rateLimitEnabled?: boolean;
	maxRequestsPerMinute?: number;
	maxRetries?: number;
	retryBackoffMultiplier?: number;
	filteringOptions?: Record<string, unknown>;
}

export interface WebhookResponse {
	id: string;
	name: string;
	url: string;
	secret: string | null;
	organizationId: string;
	userId: string;
	status: WebhookStatus;
	customHeaders: Record<string, string> | null;
	rateLimitEnabled: boolean;
	maxRequestsPerMinute: number;
	maxRetries: number;
	retryBackoffMultiplier: number;
	filteringOptions: Record<string, unknown> | null;
	lastTriggeredAt: string | null;
	successCount: number;
	failureCount: number;
	consecutiveFailures: number;
	createdAt: string;
	updatedAt: string;
}

export interface WebhookListResponse {
	webhooks: WebhookResponse[];
	total: number;
	page: number;
	limit: number;
}

export interface WebhookQuery extends Record<string, unknown> {
	page?: number;
	limit?: number;
	status?: WebhookStatus;
	organizationId?: string;
	userId?: string;
}

// Audience Service Types
export type AudienceStatus = "subscribed" | "unsubscribed";

export interface CreateAudienceRequest {
	email: string;
	firstName?: string;
	lastName?: string;
	audienceGroupId: string;
	status?: AudienceStatus;
}

export interface UpdateAudienceRequest {
	firstName?: string;
	lastName?: string;
	audienceGroupId?: string;
}

export interface AudienceResponse {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	organizationId: string;
	status: AudienceStatus;
	audienceGroupId: string;
	audienceGroupName: string;
	addedAt: string;
	unsubscribedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AudienceListResponse {
	audiences: AudienceResponse[];
	total: number;
	page: number;
	limit: number;
}

export interface AudienceQuery extends Record<string, unknown> {
	page?: number;
	limit?: number;
	search?: string;
	status?: AudienceStatus;
	audienceGroupId?: string;
	organizationId?: string;
	userId?: string;
}

export interface BulkImportAudience {
	email: string;
	firstName?: string;
	lastName?: string;
	status?: AudienceStatus;
}

export interface BulkImportAudiencesRequest {
	audienceGroupId: string;
	audiences: BulkImportAudience[];
}

export interface BulkImportError {
	email: string;
	error: string;
}

export interface BulkImportResponse {
	successful: number;
	failed: number;
	errors: BulkImportError[];
}

export interface SubscribeAudienceRequest {
	reason?: string;
}

export interface UnsubscribeAudienceRequest {
	reason?: string;
}

export interface SearchAudiencesQuery extends Record<string, unknown> {
	query: string;
	page?: number;
	limit?: number;
	status?: AudienceStatus;
	audienceGroupId?: string;
	organizationId?: string;
}

// Audience Group Types
export interface CreateAudienceGroupRequest {
	name: string;
	description?: string;
}

export interface UpdateAudienceGroupRequest {
	name?: string;
	description?: string;
}

export interface AudienceGroupResponse {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	userId: string;
	audienceCount: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface AudienceGroupListResponse {
	groups: AudienceGroupResponse[];
	total: number;
	page: number;
	limit: number;
}

export interface AudienceGroupQuery extends Record<string, unknown> {
	page?: number;
	limit?: number;
	search?: string;
	organizationId?: string;
	userId?: string;
}

export interface AudienceGroupListResponse {
	audienceGroups: AudienceGroupResponse[];
	total: number;
	page: number;
	limit: number;
}

export interface AudienceGroupResponse {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	userId: string;
	audienceCount: number;
	subscribedCount: number;
	unsubscribedCount: number;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}
