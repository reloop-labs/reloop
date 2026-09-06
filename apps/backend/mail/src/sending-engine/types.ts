/**
 * Reloop Sending Engine — shared types.
 * Pure types only, no runtime deps. The engine is fail-open by design:
 * any check that cannot complete must degrade to "allow" with a reason,
 * never block the user's send.
 */

export type IpHealth = "ready" | "warming" | "paused" | "blocklisted";
export type ProviderBucket = "gmail" | "outlook" | "yahoo" | "other";
export type GuardAction = "allow" | "throttle" | "reroute" | "pause";

export interface EgressIp {
	/** Public IPv4/IPv6 used for outbound SMTP. */
	address: string;
	/** KumoMTA egress pool / source name, e.g. "warm-pool-1". */
	pool: string;
	/** EHLO hostname that must match PTR for FCrDNS. */
	hostname: string;
	/** 1-based warmup day. 1 = brand new IP. >= 30 = fully warmed. */
	warmupDay: number;
	health: IpHealth;
}

export interface ReputationSignals {
	bounceRate: number; // 0..1
	complaintRate: number; // 0..1
	dnsblListed: boolean;
	authHealthy: boolean; // SPF+DKIM+DMARC aligned
}

export interface GuardInput {
	fromDomain: string;
	recipients: string[];
	egressIp: EgressIp;
	reputation: ReputationSignals;
	/** Emails already sent today for this (ip, provider) bucket. */
	sentTodayByProvider: Record<ProviderBucket, number>;
	dnsHealthy: boolean;
	missingRecords?: string[];
}

export interface GuardDecision {
	action: GuardAction;
	/** 0..100 deliverability score for observability. */
	score: number;
	reason: string;
	/** Per-provider quotas applied for this decision. */
	quotas: Record<ProviderBucket, number>;
	/** Recipient counts grouped by provider bucket. */
	volumes: Record<ProviderBucket, number>;
	/** Headers the mail service should forward to KumoMTA for routing. */
	headers: Record<string, string>;
	/** If true, mail service should defer/requeue instead of injecting now. */
	deferMs?: number;
}

export interface DnsblQuery {
	providerId: string;
	host: string;
	queryName: string;
}
