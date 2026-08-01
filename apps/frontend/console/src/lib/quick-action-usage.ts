const STORAGE_KEY = "reloop-console-quick-action-usage";

export type QuickActionUsage = {
	/** action id → hit count */
	counts: Record<string, number>;
	/** action id → last used epoch ms */
	lastUsed: Record<string, number>;
};

function emptyUsage(): QuickActionUsage {
	return { counts: {}, lastUsed: {} };
}

export function readQuickActionUsage(): QuickActionUsage {
	if (typeof window === "undefined") return emptyUsage();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyUsage();
		const parsed = JSON.parse(raw) as Partial<QuickActionUsage>;
		return {
			counts: parsed.counts ?? {},
			lastUsed: parsed.lastUsed ?? {},
		};
	} catch {
		return emptyUsage();
	}
}

export function trackQuickAction(id: string) {
	if (typeof window === "undefined") return;
	try {
		const usage = readQuickActionUsage();
		usage.counts[id] = (usage.counts[id] ?? 0) + 1;
		usage.lastUsed[id] = Date.now();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
	} catch {
		// ignore quota / private mode
	}
}

/** Higher score = more frequently / recently used. */
export function scoreQuickAction(
	id: string,
	usage: QuickActionUsage,
	now = Date.now(),
): number {
	const count = usage.counts[id] ?? 0;
	const last = usage.lastUsed[id];
	if (count === 0) return 0;
	// Recency boost decays over ~14 days
	const days = last ? (now - last) / (1000 * 60 * 60 * 24) : 30;
	const recency = Math.max(0, 1 - days / 14);
	return count * 10 + recency * 5;
}

export function sortByUsage<T extends { id: string }>(
	items: readonly T[],
	usage?: QuickActionUsage,
): T[] {
	const u = usage ?? readQuickActionUsage();
	const now = Date.now();
	return [...items].sort((a, b) => {
		const diff =
			scoreQuickAction(b.id, u, now) - scoreQuickAction(a.id, u, now);
		if (diff !== 0) return diff;
		return 0;
	});
}
