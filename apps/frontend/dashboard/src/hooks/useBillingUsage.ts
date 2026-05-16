"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BillingUsage {
	plan: {
		name: string;
		monthlyCredits: number;
		basePriceUsd: string;
		billingCycle: "monthly" | "annual";
		ratePerSecond: number;
		ratePerMinute: number;
		ratePerHour: number;
		maxAttachmentSizeMb: number;
		overageLimit: number;
	};
	subscription: {
		status: string;
		creditsUsed: number;
		creditsRemaining: number;
		currentPeriodStart: string;
		currentPeriodEnd: string;
	};
	stats: {
		emailsSentThisMonth: number;
		emailsSentToday: number;
		emailsSentYesterday: number;
		dailyAverage: number;
		deliveryRate: number;
	};
	members: {
		total: number;
	};
}

export interface UsageLiveUpdate {
	organizationId: string;
	creditsUsed: number;
	creditsRemaining: number;
	monthlyCredits: number;
	periodStart: string;
	periodEnd: string;
	emailsSentToday: number;
}

const BILLING_BASE = process.env.NEXT_PUBLIC_BILLING_URL ?? "http://localhost:8023/api/billing";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBillingUsage() {
	const [data, setData] = useState<BillingUsage | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	const fetchUsage = async () => {
		try {
			const res = await fetch(`${BILLING_BASE}/usage`, {
				credentials: "include", // send session cookie
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const json = (await res.json()) as BillingUsage;
			setData(json);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load usage");
		} finally {
			setIsLoading(false);
		}
	};

	// Apply a live USAGE_UPDATED patch without a full re-fetch
	const applyLiveUpdate = (update: UsageLiveUpdate) => {
		setData((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				subscription: {
					...prev.subscription,
					creditsUsed: update.creditsUsed,
					creditsRemaining: update.creditsRemaining,
					currentPeriodStart: update.periodStart,
					currentPeriodEnd: update.periodEnd,
				},
				stats: {
					...prev.stats,
					emailsSentThisMonth: update.creditsUsed,
					emailsSentToday: update.emailsSentToday,
				},
			};
		});
	};

	useEffect(() => {
		fetchUsage();

		// Open SSE connection for real-time updates
		const es = new EventSource(`${BILLING_BASE}/sse/usage`, {
			withCredentials: true,
		});

		es.onmessage = (event) => {
			try {
				const payload = JSON.parse(event.data) as UsageLiveUpdate;
				applyLiveUpdate(payload);
			} catch {
				// ignore malformed frames
			}
		};

		es.onerror = () => {
			// EventSource auto-reconnects; we just log
			console.warn("[useBillingUsage] SSE connection error — will retry");
		};

		eventSourceRef.current = es;

		return () => {
			es.close();
		};
	}, []);

	return {
		data,
		isLoading,
		error,
		refetch: fetchUsage,
	};
}
