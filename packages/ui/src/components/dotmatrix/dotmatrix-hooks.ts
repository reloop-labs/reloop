"use client";

import { useEffect, useState } from "react";

export type DotMatrixPhase = "idle" | "running";

export interface DotMatrixPhaseOptions {
	animated?: boolean;
	hoverAnimated?: boolean;
	speed?: number;
}

export function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) {
			return;
		}
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mql.matches);

		const handler = (event: MediaQueryListEvent) => {
			setReduced(event.matches);
		};

		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, []);

	return reduced;
}

export function useDotMatrixPhases({
	animated = true,
	hoverAnimated = false,
}: DotMatrixPhaseOptions = {}) {
	const [isHovered, setIsHovered] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const phase: DotMatrixPhase =
		animated || (hoverAnimated && isHovered) ? "running" : "idle";

	const onMouseEnter = () => {
		if (hoverAnimated) {
			setIsHovered(true);
		}
	};

	const onMouseLeave = () => {
		if (hoverAnimated) {
			setIsHovered(false);
		}
	};

	return {
		phase: isMounted ? phase : "idle",
		isHovered,
		onMouseEnter,
		onMouseLeave,
	};
}
