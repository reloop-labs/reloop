"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Module-level so Suspense remounts (useSearchParams) don't drop in-flight
 * navigation state and leave the bar frozen before 100%.
 */
let navigating = false;
const creepTimers: ReturnType<typeof setTimeout>[] = [];

function clearCreep() {
	while (creepTimers.length > 0) {
		const t = creepTimers.pop();
		if (t) clearTimeout(t);
	}
}

/**
 * Thin blue top progress bar for App Router navigations.
 * Creeps while loading; always animates to 100% when the route settles.
 */
export function NavigationProgress() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;

	const [visible, setVisible] = useState(false);
	const [progress, setProgress] = useState(0);

	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const prevRoute = useRef(routeKey);
	const isFirstRoute = useRef(true);
	const mounted = useRef(true);
	const finishRef = useRef<() => void>(() => {});

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const finish = useCallback(() => {
		if (!navigating) return;

		clearCreep();
		if (maxTimer.current) {
			clearTimeout(maxTimer.current);
			maxTimer.current = null;
		}
		if (hideTimer.current) {
			clearTimeout(hideTimer.current);
			hideTimer.current = null;
		}

		navigating = false;
		if (!mounted.current) return;

		// Always hit the end of the bar
		setVisible(true);
		setProgress(100);

		// Hold at 100%, then fade out
		hideTimer.current = setTimeout(() => {
			if (!mounted.current) return;
			setVisible(false);
			hideTimer.current = setTimeout(() => {
				if (!mounted.current) return;
				setProgress(0);
				hideTimer.current = null;
			}, 200);
		}, 320);
	}, []);

	finishRef.current = finish;

	const start = useCallback(() => {
		if (navigating) return;
		navigating = true;

		clearCreep();
		if (hideTimer.current) {
			clearTimeout(hideTimer.current);
			hideTimer.current = null;
		}
		if (maxTimer.current) {
			clearTimeout(maxTimer.current);
			maxTimer.current = null;
		}

		if (mounted.current) {
			setVisible(true);
			setProgress(0);
		}

		requestAnimationFrame(() => {
			if (!mounted.current || !navigating) return;
			setProgress(12);
			creepTimers.push(
				setTimeout(() => {
					if (navigating && mounted.current) setProgress(32);
				}, 80),
				setTimeout(() => {
					if (navigating && mounted.current) setProgress(52);
				}, 220),
				setTimeout(() => {
					if (navigating && mounted.current) setProgress(68);
				}, 500),
				setTimeout(() => {
					if (navigating && mounted.current) setProgress(80);
				}, 1000),
				setTimeout(() => {
					if (navigating && mounted.current) setProgress(90);
				}, 1800),
			);
		});

		// Safety net — never hang forever
		maxTimer.current = setTimeout(() => {
			finishRef.current();
		}, 10_000);
	}, []);

	// Route settled → complete to 100%
	useEffect(() => {
		if (isFirstRoute.current) {
			isFirstRoute.current = false;
			prevRoute.current = routeKey;
			// Remounted mid-nav: finish so the bar never sticks
			if (navigating) {
				if (mounted.current) {
					setVisible(true);
					setProgress((p) => (p > 0 ? p : 85));
				}
				requestAnimationFrame(() => {
					requestAnimationFrame(() => finishRef.current());
				});
			}
			return;
		}

		if (prevRoute.current === routeKey) return;
		prevRoute.current = routeKey;

		if (navigating) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => finishRef.current());
			});
			return;
		}

		// Missed click intercept (programmatic nav): quick complete flash
		navigating = true;
		if (mounted.current) {
			setVisible(true);
			setProgress(60);
		}
		requestAnimationFrame(() => finishRef.current());
	}, [routeKey]);

	// Start on internal link clicks + back/forward
	useEffect(() => {
		const isModifiedClick = (e: MouseEvent) =>
			e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

		const onClick = (e: MouseEvent) => {
			if (isModifiedClick(e) || e.defaultPrevented) return;

			const anchor = (e.target as Element | null)?.closest?.("a");
			if (!anchor) return;
			if (anchor.target && anchor.target !== "_self") return;
			if (anchor.hasAttribute("download")) return;

			const href = anchor.getAttribute("href");
			if (!href || href.startsWith("#")) return;
			if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

			let url: URL;
			try {
				url = new URL(href, window.location.href);
			} catch {
				return;
			}

			if (url.origin !== window.location.origin) return;

			if (
				url.pathname === window.location.pathname &&
				url.search === window.location.search
			) {
				return;
			}

			start();
		};

		const onPopState = () => {
			start();
		};

		document.addEventListener("click", onClick, true);
		window.addEventListener("popstate", onPopState);
		return () => {
			document.removeEventListener("click", onClick, true);
			window.removeEventListener("popstate", onPopState);
		};
	}, [start]);

	useEffect(() => {
		return () => {
			clearCreep();
			if (hideTimer.current) clearTimeout(hideTimer.current);
			if (maxTimer.current) clearTimeout(maxTimer.current);
		};
	}, []);

	return (
		<div
			aria-hidden
			className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2.5px] overflow-hidden"
		>
			<div
				className="h-full w-full origin-left bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.7)] will-change-transform"
				style={{
					transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})`,
					opacity: visible ? 1 : 0,
					transition:
						progress >= 100
							? "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease 200ms"
							: "transform 220ms ease-out, opacity 150ms ease",
				}}
			/>
		</div>
	);
}
