"use client";

import { cn } from "@reloop/ui/cn";
import { KbdKey } from "@reloop/ui/kbd-key";
import {
	AnimatePresence,
	motion,
	type Transition,
	useReducedMotion,
} from "framer-motion";
import { type ReactNode, useEffect } from "react";
import { useUIStore } from "#/store/use-ui-store";

/** Hold Space this long (ms) before shortcut hints appear. */
const LONG_PRESS_MS = 400;

/**
 * Smooth ease-out only (no spring). Matches transitions.dev --ease-smooth-out.
 * Spring + layout was fighting the width clip and caused a shaky expand.
 */
const EASE_SMOOTH_OUT = [0.22, 1, 0.36, 1] as const;
/** Keep under 300ms; quick enough for a reveal, slow enough to read. */
const HINT_DURATION = 0.2;
/** Fixed px width of the kbd face (h-4 / min-w-4) — avoids janky width:"auto". */
const HINT_WIDTH_PX = 16;
const HINT_GAP_PX = 4;

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
	if (target.closest('[contenteditable="true"], [role="textbox"]')) {
		return true;
	}
	return false;
}

function isSpaceEvent(e: KeyboardEvent): boolean {
	return e.code === "Space" || e.key === " " || e.key === "Spacebar";
}

/**
 * Global listener: long-press Space reveals all in-context shortcut hints.
 * Mount once near the app root (e.g. Providers). Renders nothing.
 */
export function KeyboardShortcutsRevealListener() {
	const setShortcutsRevealed = useUIStore((s) => s.setShortcutsRevealed);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | null = null;
		let spaceHeld = false;
		let revealed = false;

		const clearTimer = () => {
			if (timer != null) {
				clearTimeout(timer);
				timer = null;
			}
		};

		const hide = () => {
			spaceHeld = false;
			revealed = false;
			clearTimer();
			setShortcutsRevealed(false);
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (!isSpaceEvent(e)) return;
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			if (isEditableTarget(e.target)) return;

			// Already holding — block page scroll while revealed / waiting.
			if (e.repeat) {
				if (spaceHeld || revealed) e.preventDefault();
				return;
			}

			spaceHeld = true;
			// Prevent space-scroll while we may reveal shortcuts.
			e.preventDefault();

			clearTimer();
			timer = setTimeout(() => {
				if (!spaceHeld) return;
				revealed = true;
				setShortcutsRevealed(true);
			}, LONG_PRESS_MS);
		};

		const onKeyUp = (e: KeyboardEvent) => {
			if (!isSpaceEvent(e)) return;
			hide();
		};

		const onBlur = () => {
			hide();
		};

		const onVisibilityChange = () => {
			if (document.hidden) hide();
		};

		window.addEventListener("keydown", onKeyDown, true);
		window.addEventListener("keyup", onKeyUp, true);
		window.addEventListener("blur", onBlur);
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			hide();
			window.removeEventListener("keydown", onKeyDown, true);
			window.removeEventListener("keyup", onKeyUp, true);
			window.removeEventListener("blur", onBlur);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [setShortcutsRevealed]);

	return null;
}

/** Whether shortcut hints are currently revealed (long-press Space). */
export function useShortcutsRevealed(): boolean {
	return useUIStore((s) => s.isShortcutsRevealed);
}

const shortcutKbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	// bottom shelf under the key
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

/**
 * Always-visible keycap for action buttons (Create, Docs, Refresh, …).
 * Same physical key style as `ShortcutHint`, without the Space-reveal gate.
 */
export function ActionKbd({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<KbdKey className={cn(shortcutKbdClassName, className)}>{children}</KbdKey>
	);
}

/**
 * Renders a keycap hint only while shortcuts are revealed (long-press Space).
 *
 * Single-layer tween (no spring, no nested layout):
 * - width 0 → fixed px (not "auto") so the parent button grows smoothly
 * - opacity fade only — no scale/x that fights the width clip
 *
 * Place next to the control that owns the shortcut.
 */
export function ShortcutHint({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const revealed = useShortcutsRevealed();
	const reduceMotion = useReducedMotion();

	const transition: Transition = reduceMotion
		? { duration: 0 }
		: { duration: HINT_DURATION, ease: EASE_SMOOTH_OUT };

	return (
		<AnimatePresence initial={false}>
			{revealed ? (
				<motion.span
					key="shortcut-hint"
					initial={
						reduceMotion
							? false
							: {
									opacity: 0,
									width: 0,
									marginLeft: 0,
								}
					}
					animate={{
						opacity: 1,
						width: HINT_WIDTH_PX,
						marginLeft: HINT_GAP_PX,
					}}
					exit={{
						opacity: 0,
						width: 0,
						marginLeft: 0,
					}}
					transition={transition}
					className="inline-flex shrink-0 items-center justify-center overflow-hidden"
				>
					<KbdKey className={cn(shortcutKbdClassName, className)}>
						{children}
					</KbdKey>
				</motion.span>
			) : null}
		</AnimatePresence>
	);
}
