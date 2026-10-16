/**
 * spam-risk.ts — pure organization spam-risk score for the admin API.
 *
 * Inputs are already-fetched facts (org age, 7d send stats, blocks, domain
 * signals); output is a 0–100 score, a level matching suspectSeverity, and
 * the signals that produced it so an admin can see *why* before blocking.
 */

import type { DomainRiskSignal } from "@reloop/db/domain-risk";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskSignal {
	id: string;
	points: number;
	detail: string;
	domain?: string;
}

export interface OrgRiskFacts {
	createdAt: Date;
	status: "active" | "suspended" | "deleted";
	isSuspect: boolean;
	/** Last 7 days of email_log. */
	sent7d: number;
	bounced7d: number;
	complaints7d: number;
	/** Sends in the last 24h, for spike detection against the 7d average. */
	sent24h: number;
	activeSendingBlock: boolean;
	pastSendingBlocks: number;
	domainsAdded24h: number;
	domains: Array<{ domain: string; signals: DomainRiskSignal[] }>;
}

export interface OrgRisk {
	score: number;
	level: RiskLevel;
	signals: RiskSignal[];
}

/** Below this volume a single bounce swings the rate too far to score. */
export const MIN_SENT_FOR_RATES = 20;

export function riskLevel(score: number): RiskLevel {
	if (score >= 70) return "critical";
	if (score >= 45) return "high";
	if (score >= 20) return "medium";
	return "low";
}

const pct = (r: number) => `${(r * 100).toFixed(2)}%`;

export function scoreOrgRisk(facts: OrgRiskFacts, now = new Date()): OrgRisk {
	const signals: RiskSignal[] = [];
	const add = (id: string, points: number, detail: string) =>
		signals.push({ id, points, detail });

	const ageHours = (now.getTime() - facts.createdAt.getTime()) / 3_600_000;
	if (ageHours < 24)
		add("org_age_lt_24h", 10, "Organization created in the last 24h");
	else if (ageHours < 24 * 7)
		add("org_age_lt_7d", 5, "Organization created this week");

	if (facts.activeSendingBlock) {
		add(
			"active_sending_block",
			30,
			"Sending is paused by the reputation guard right now",
		);
	}
	if (facts.pastSendingBlocks > 0) {
		add(
			"past_sending_blocks",
			Math.min(facts.pastSendingBlocks * 10, 20),
			`${facts.pastSendingBlocks} earlier reputation block(s)`,
		);
	}

	if (facts.sent7d >= MIN_SENT_FOR_RATES) {
		const complaintRate = facts.complaints7d / facts.sent7d;
		const bounceRate = facts.bounced7d / facts.sent7d;
		if (complaintRate >= 0.003) {
			add(
				"complaint_rate_high",
				30,
				`Complaint rate ${pct(complaintRate)} (block ≥ 0.30%)`,
			);
		} else if (complaintRate >= 0.001) {
			add(
				"complaint_rate_warn",
				15,
				`Complaint rate ${pct(complaintRate)} (warn ≥ 0.10%)`,
			);
		}
		if (bounceRate >= 0.05) {
			add(
				"bounce_rate_high",
				20,
				`Bounce rate ${pct(bounceRate)} (block ≥ 5%)`,
			);
		} else if (bounceRate >= 0.03) {
			add("bounce_rate_warn", 10, `Bounce rate ${pct(bounceRate)} (warn ≥ 3%)`);
		}
	}

	// Spike: today is 5x the trailing daily average, at meaningful volume.
	const priorDailyAvg = Math.max(facts.sent7d - facts.sent24h, 0) / 6;
	if (facts.sent24h >= 500 && facts.sent24h > Math.max(priorDailyAvg, 1) * 5) {
		add(
			"volume_spike",
			10,
			`${facts.sent24h} sends in 24h vs ~${Math.round(priorDailyAvg)}/day before`,
		);
	}

	if (facts.domainsAdded24h >= 5) {
		add("domain_churn", 15, `${facts.domainsAdded24h} domains added in 24h`);
	}

	// Per-domain signals: count each signal type once (worst domain), so ten
	// fresh domains don't drown every other signal.
	const worstByType = new Map<string, RiskSignal>();
	for (const d of facts.domains) {
		for (const s of d.signals) {
			const prev = worstByType.get(s.id);
			if (!prev || s.points > prev.points) {
				worstByType.set(s.id, { ...s, domain: d.domain });
			}
		}
	}
	signals.push(...worstByType.values());

	if (facts.isSuspect) add("already_suspect", 10, "Already flagged as suspect");

	signals.sort((a, b) => b.points - a.points);
	const score = Math.min(
		signals.reduce((sum, s) => sum + s.points, 0),
		100,
	);
	return { score, level: riskLevel(score), signals };
}
