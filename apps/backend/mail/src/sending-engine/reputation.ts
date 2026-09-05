import type { ReputationSignals } from "./types";

export const BOUNCE_PAUSE_THRESHOLD = 0.05; // 5% — Gmail/Outlook bulk limit
export const COMPLAINT_PAUSE_THRESHOLD = 0.001; // 0.1%
export const BOUNCE_WARN_THRESHOLD = 0.03;
export const COMPLAINT_WARN_THRESHOLD = 0.0005;

/**
 * 0..100 sender score. Starts at 100, subtracts weighted penalties.
 * Pure function — easy to unit test and reuse in dashboard + Lua sync.
 */
export function computeScore(signals: ReputationSignals): number {
	let score = 100;
	// Bounce penalty: 0% -> 0, 5% -> -40, 10%+ -> -60 (clamped)
	score -= Math.min(60, (signals.bounceRate / 0.05) * 40);
	// Complaint penalty: 0.1% -> -40, 0.3%+ -> -60 (clamped)
	score -= Math.min(60, (signals.complaintRate / 0.001) * 40);
	if (signals.dnsblListed) score -= 30;
	if (!signals.authHealthy) score -= 15;
	return Math.max(0, Math.min(100, Math.round(score)));
}

export function shouldPause(signals: ReputationSignals): {
	pause: boolean;
	reason?: string;
} {
	if (signals.dnsblListed) return { pause: true, reason: "IP is DNSBL-listed" };
	if (signals.bounceRate >= BOUNCE_PAUSE_THRESHOLD)
		return {
			pause: true,
			reason: `bounce rate ${(signals.bounceRate * 100).toFixed(2)}% >= 5%`,
		};
	if (signals.complaintRate >= COMPLAINT_PAUSE_THRESHOLD)
		return {
			pause: true,
			reason: `complaint rate ${(signals.complaintRate * 100).toFixed(3)}% >= 0.1%`,
		};
	return { pause: false };
}

export function shouldThrottle(signals: ReputationSignals): {
	throttle: boolean;
	reason?: string;
} {
	if (signals.bounceRate >= BOUNCE_WARN_THRESHOLD)
		return {
			throttle: true,
			reason: `elevated bounce rate ${(signals.bounceRate * 100).toFixed(2)}%`,
		};
	if (signals.complaintRate >= COMPLAINT_WARN_THRESHOLD)
		return {
			throttle: true,
			reason: `elevated complaint rate ${(signals.complaintRate * 100).toFixed(3)}%`,
		};
	return { throttle: false };
}
