import {
	bucketVolumes,
	evaluateSend,
	type GuardDecision,
	quotasForDay,
	warmupDayFromDates,
} from "@reloop/be-mail/sending-engine";
import { RedisCache } from "@reloop/cache/redis-client";
import { db } from "@reloop/db/client";
import { sendingIp } from "@reloop/db/schema";
import { log } from "evlog";

const redis = new RedisCache("sending-engine", 300);

function allRecipients(body: {
	to: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
}): string[] {
	const collect = (v?: string | string[]): string[] =>
		!v ? [] : Array.isArray(v) ? v : [v];
	return [...collect(body.to), ...collect(body.cc), ...collect(body.bcc)];
}

function todayKey(): string {
	return new Date().toISOString().slice(0, 10);
}

/**
 * Step 0 — Sending Engine guard. Fail-open: any error returns allow
 * so users are never blocked by observability/reputation infra.
 */
export async function guardSend_step0({
	organizationId,
	domainName,
	body,
	dnsHealthy,
	missingRecords,
}: {
	organizationId: string;
	domainName: string;
	body: {
		to: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
	};
	dnsHealthy: boolean;
	missingRecords: string[];
}): Promise<{ decision: GuardDecision; sendingIpId?: string }> {
	try {
		const recipients = allRecipients(body);
		const egressPool = process.env.EGRESS_POOL ?? "default";
		const egressAddress = process.env.EGRESS_IP ?? "127.0.0.1";
		const ehloHostname =
			process.env.EHLO_HOSTNAME ?? process.env.HOSTNAME ?? "mail.reloop.sh";

		// Load or default the egress IP row (single-row for self-host).
		let row = await db.query.sendingIp.findFirst().catch(() => undefined);
		if (!row) {
			try {
				const inserted = await db
					.insert(sendingIp)
					.values({
						address: egressAddress,
						pool: egressPool,
						hostname: ehloHostname,
						health: "warming",
						warmupDay: 1,
					})
					.returning()
					.catch(() => undefined);
				row = inserted?.[0] as typeof row;
			} catch {
				row = undefined;
			}
		}

		const warmupDay = row ? warmupDayFromDates(new Date(row.firstSeenAt)) : 1;
		const quotas = quotasForDay(warmupDay);
		const volumes = bucketVolumes(recipients);

		// Redis daily counters per (ip, provider). Fail-open to 0 on error.
		const sentTodayByProvider = {
			gmail: 0,
			outlook: 0,
			yahoo: 0,
			other: 0,
		} as Record<"gmail" | "outlook" | "yahoo" | "other", number>;
		for (const p of Object.keys(
			sentTodayByProvider,
		) as (keyof typeof sentTodayByProvider)[]) {
			const v = await redis
				.get<number>(`sent:${egressAddress}:${p}:${todayKey()}`)
				.catch(() => undefined);
			sentTodayByProvider[p] = typeof v === "number" ? v : 0;
		}

		const decision = evaluateSend({
			fromDomain: domainName,
			recipients,
			egressIp: {
				address: row?.address ?? egressAddress,
				pool: row?.pool ?? egressPool,
				hostname: row?.hostname ?? ehloHostname,
				warmupDay,
				health:
					(row?.health as
						| "ready"
						| "warming"
						| "paused"
						| "blocklisted"
						| undefined) ?? "warming",
			},
			reputation: {
				bounceRate: row?.bounceRate ?? 0,
				complaintRate: row?.complaintRate ?? 0,
				dnsblListed: (row?.health as string) === "blocklisted",
				authHealthy: dnsHealthy,
			},
			sentTodayByProvider,
			dnsHealthy,
			missingRecords,
		});

		// Increment counters optimistically (best-effort).
		for (const p of Object.keys(volumes) as (keyof typeof volumes)[]) {
			if (volumes[p] > 0) {
				await redis
					.set(
						`sent:${egressAddress}:${p}:${todayKey()}`,
						(sentTodayByProvider[p] ?? 0) + (volumes[p] ?? 0),
						90000,
					)
					.catch(() => {});
			}
		}

		log.info({
			message: `Sending-engine guard: ${decision.action}`,
			organizationId,
			domain: domainName,
			score: decision.score,
			reason: decision.reason,
			quotas,
		});

		return { decision, sendingIpId: row?.id };
	} catch (error) {
		log.warn({
			message: "Sending-engine guard failed open",
			error: error instanceof Error ? error.message : String(error),
			organizationId,
		});
		const volumes = bucketVolumes(allRecipients(body));
		const quotas = quotasForDay(30);
		return {
			decision: {
				action: "allow",
				score: 100,
				reason: "guard failed open",
				quotas,
				volumes,
				headers: { "X-Reloop-Decision": "allow-fail-open" },
			},
		};
	}
}
