"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Longest sidebar icon animation (gear-turn: 1.1s + 0.45s delay) + buffer. */
const FALLBACK_MS = 1700;

/** How long the pointer must stay before the icon animation starts. */
const HOVER_DELAY_MS = 300;

/**
 * After a sustained hover, plays CSS animations to completion —
 * even if the pointer leaves mid-animation.
 *
 * Pair with `data-animating` on a `group` and
 * `group-data-[animating=true]:animate-*` on children.
 */
export function usePlayAnimationOnHover(
	fallbackMs = FALLBACK_MS,
	hoverDelayMs = HOVER_DELAY_MS,
) {
	const [isAnimating, setIsAnimating] = useState(false);
	const runningRef = useRef(0);
	const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const hoverDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const isAnimatingRef = useRef(false);

	const clearFallbackTimer = useCallback(() => {
		if (fallbackTimerRef.current != null) {
			clearTimeout(fallbackTimerRef.current);
			fallbackTimerRef.current = null;
		}
	}, []);

	const clearHoverDelayTimer = useCallback(() => {
		if (hoverDelayTimerRef.current != null) {
			clearTimeout(hoverDelayTimerRef.current);
			hoverDelayTimerRef.current = null;
		}
	}, []);

	const stop = useCallback(() => {
		runningRef.current = 0;
		clearFallbackTimer();
		isAnimatingRef.current = false;
		setIsAnimating(false);
	}, [clearFallbackTimer]);

	const startAnimation = useCallback(() => {
		if (isAnimatingRef.current) return;
		isAnimatingRef.current = true;
		runningRef.current = 0;
		setIsAnimating(true);
		clearFallbackTimer();
		fallbackTimerRef.current = setTimeout(stop, fallbackMs);
	}, [clearFallbackTimer, fallbackMs, stop]);

	/** Begin the hover dwell timer; animation starts after `hoverDelayMs`. */
	const onPointerEnter = useCallback(() => {
		if (isAnimatingRef.current || hoverDelayTimerRef.current != null) return;
		hoverDelayTimerRef.current = setTimeout(() => {
			hoverDelayTimerRef.current = null;
			startAnimation();
		}, hoverDelayMs);
	}, [hoverDelayMs, startAnimation]);

	/** Cancel a pending dwell; leave in-progress animations alone. */
	const onPointerLeave = useCallback(() => {
		clearHoverDelayTimer();
	}, [clearHoverDelayTimer]);

	const onAnimationStart = useCallback(() => {
		if (!isAnimatingRef.current) return;
		runningRef.current += 1;
		// Keep the fallback armed from the latest start (covers staggered delays).
		clearFallbackTimer();
		fallbackTimerRef.current = setTimeout(stop, fallbackMs);
	}, [clearFallbackTimer, fallbackMs, stop]);

	const onAnimationEnd = useCallback(() => {
		if (!isAnimatingRef.current) return;
		runningRef.current = Math.max(0, runningRef.current - 1);
		if (runningRef.current === 0) {
			// Brief settle so a delayed sibling can still fire animationstart.
			clearFallbackTimer();
			fallbackTimerRef.current = setTimeout(stop, 120);
		}
	}, [clearFallbackTimer, stop]);

	useEffect(
		() => () => {
			clearFallbackTimer();
			clearHoverDelayTimer();
		},
		[clearFallbackTimer, clearHoverDelayTimer],
	);

	return {
		isAnimating,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
		/** Spread onto the hover group element. */
		groupProps: {
			"data-animating": isAnimating || undefined,
			onPointerEnter,
			onPointerLeave,
			onAnimationStart,
			onAnimationEnd,
		} as const,
	};
}
