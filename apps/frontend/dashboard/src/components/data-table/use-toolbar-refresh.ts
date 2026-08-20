"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long the rotate icon spins after a refresh is triggered. */
export const REFRESH_SPIN_MS = 2000;

/**
 * Shared busy/spin state for list toolbar refresh buttons.
 * Matches domain / API keys: disable + animate for a short fixed window.
 */
export function useToolbarRefresh(onRefresh: () => void | Promise<void>) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const refresh = useCallback(() => {
		void onRefresh();
		setIsRefreshing(true);
		if (spinTimeoutRef.current != null) {
			clearTimeout(spinTimeoutRef.current);
		}
		spinTimeoutRef.current = setTimeout(() => {
			setIsRefreshing(false);
			spinTimeoutRef.current = null;
		}, REFRESH_SPIN_MS);
	}, [onRefresh]);

	useEffect(() => {
		return () => {
			if (spinTimeoutRef.current != null) {
				clearTimeout(spinTimeoutRef.current);
			}
		};
	}, []);

	return { isRefreshing, refresh };
}
