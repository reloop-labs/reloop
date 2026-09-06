import { computeScore, shouldPause, shouldThrottle } from "./reputation";
import type { GuardDecision, GuardInput } from "./types";
import { bucketVolumes, overQuota, quotasForDay } from "./warmup";

/**
 * The core "user never worries" entry point.
 * Pure + synchronous so it can run in the mail service hot path,
 * in tests, and (via JSON) in KumoMTA policy sync.
 *
 * Precedence: pause (reputation/DNSBL) > throttle (warmup quota) >
 * throttle (reputation warn) > allow.
 */
export function evaluateSend(input: GuardInput): GuardDecision {
	const volumes = bucketVolumes(input.recipients);
	const quotas = quotasForDay(input.egressIp.warmupDay);
	const score = computeScore(input.reputation);

	const baseHeaders = {
		"X-Reloop-Pool": input.egressIp.pool,
		"X-Reloop-Egress-Ip": input.egressIp.address,
		"X-Reloop-Warmup-Day": String(input.egressIp.warmupDay),
		"X-Reloop-Score": String(score),
	};

	// 1. Hard pause — reputation breach or blocklisted/paused IP.
	const pause = shouldPause(input.reputation);
	if (
		pause.pause ||
		input.egressIp.health === "paused" ||
		input.egressIp.health === "blocklisted"
	) {
		return {
			action: "pause",
			score,
			reason: pause.reason ?? `egress IP is ${input.egressIp.health}`,
			quotas,
			volumes,
			headers: { ...baseHeaders, "X-Reloop-Decision": "pause" },
		};
	}

	// 2. DNS unhealthy — reroute intent (mail service still sends via healthy pool,
	//    but flags so dashboard can prompt the user to fix SPF/DKIM/DMARC).
	if (!input.dnsHealthy || !input.reputation.authHealthy) {
		return {
			action: "reroute",
			score,
			reason: `DNS auth unhealthy: ${(input.missingRecords ?? []).join(",") || "auth"}`,
			quotas,
			volumes,
			headers: { ...baseHeaders, "X-Reloop-Decision": "reroute" },
		};
	}

	// 3. Warmup quota breach — throttle (defer) rather than fail.
	const over = overQuota(volumes, input.sentTodayByProvider, quotas);
	if (over.length > 0) {
		return {
			action: "throttle",
			score,
			reason: `warmup quota exceeded for ${over.join(",")} on day ${input.egressIp.warmupDay}`,
			quotas,
			volumes,
			headers: { ...baseHeaders, "X-Reloop-Decision": "throttle" },
			deferMs: 60_000,
		};
	}

	// 4. Reputation warning — halve effective throughput via throttle signal.
	const warn = shouldThrottle(input.reputation);
	if (warn.throttle) {
		return {
			action: "throttle",
			score,
			reason: warn.reason ?? "reputation warning",
			quotas,
			volumes,
			headers: { ...baseHeaders, "X-Reloop-Decision": "throttle" },
			deferMs: 30_000,
		};
	}

	return {
		action: "allow",
		score,
		reason: "healthy",
		quotas,
		volumes,
		headers: { ...baseHeaders, "X-Reloop-Decision": "allow" },
	};
}
