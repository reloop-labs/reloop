"use client";

import { cn } from "@reloop/ui/cn";
import { KbdKey } from "@reloop/ui/kbd-key";
import {
	AnimatePresence,
	motion,
	type Transition,
	useReducedMotion,
} from "framer-motion";
import {
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
/** Fallback single-key face width when content has not been measured yet. */
const HINT_WIDTH_PX = 16;
const HINT_GAP_PX = 4;

const MODIFIER_MAP: Record<string, string> = {
	cmd: "⌘",
	command: "⌘",
	meta: "⌘",
	mod: "⌘",
	ctrl: "⌃",
	control: "⌃",
	alt: "⌥",
	option: "⌥",
	opt: "⌥",
	shift: "⇧",
	"⇧": "⇧",
	"⌘": "⌘",
	"⌃": "⌃",
	"⌥": "⌥",
};

/** Normalize one token (e.g. "Shift", "shift+t", "G") into display keys. */
function normalizeKeyToken(token: string): string[] {
	const trimmed = token.trim();
	if (!trimmed) return [];
	if (/^[⌘⇧⌃⌥]$/.test(trimmed)) return [trimmed];
	if (trimmed.includes("+")) {
		return trimmed
			.split("+")
			.flatMap((part) => normalizeKeyToken(part))
			.filter(Boolean);
	}
	const lower = trimmed.toLowerCase();
	if (MODIFIER_MAP[lower]) return [MODIFIER_MAP[lower]];
	if (trimmed.length === 1) return [trimmed.toUpperCase()];
	return [trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()];
}

/**
 * Parse a shortcut label into sequence steps of keycaps.
 * - "G E" → [["G"], ["E"]]
 * - "G Shift+T" → [["G"], ["⇧", "T"]]
 * - "⌘⇧L" / "T" → [["⌘", "⇧", "L"]] / [["T"]]
 */
function parseShortcutSteps(label: string): string[][] {
	const parts = label.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return [];

	// Multi-word labels are g-sequences (G E, G Shift+T, G ,)
	if (parts.length > 1) {
		return parts.map((part) => normalizeKeyToken(part));
	}

	const part = parts[0] ?? "";
	const compact = part.match(/([⌘⇧⌃⌥]|[^\s⌘⇧⌃⌥]+)/g);
	if (compact && compact.length > 1) {
		return [compact.flatMap((t) => normalizeKeyToken(t))];
	}
	return [normalizeKeyToken(part)];
}

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

function ShortcutKeycaps({
	steps,
	className,
}: {
	steps: string[][];
	className?: string;
}) {
	return (
		<span className="inline-flex items-center gap-1">
			{steps.map((group, gi) => (
				<span key={`step-${gi}`} className="inline-flex items-center gap-0.5">
					{group.map((key, ki) => (
						<KbdKey
							key={`${key}-${ki}`}
							className={cn(
								shortcutKbdClassName,
								"w-auto min-w-4 px-1 font-mono text-[10px]",
								key.length > 1 && "px-1.5",
								className,
							)}
						>
							{key}
						</KbdKey>
					))}
				</span>
			))}
		</span>
	);
}

/**
 * Renders a keycap hint only while shortcuts are revealed (long-press Space).
 *
 * Supports multi-key labels (e.g. "G E", "G Shift+T") as separate keycaps.
 * Renders nothing when hidden so sidebar layout / hit targets stay clean.
 * Width is measured from the real keycap row so the leading key is never clipped.
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
	const innerRef = useRef<HTMLSpanElement>(null);
	const [contentWidth, setContentWidth] = useState(HINT_WIDTH_PX);

	const steps = useMemo(() => {
		if (typeof children === "string" || typeof children === "number") {
			return parseShortcutSteps(String(children));
		}
		return null;
	}, [children]);

	// Generous pre-estimate so the first animated frame is wide enough for "G C"
	// (avoids one-frame clip of the leading key before measure runs).
	const estimatedWidth = useMemo(() => {
		if (!steps || steps.length === 0) return HINT_WIDTH_PX;
		const keys = steps.flat();
		// ~20px face+padding per key, 4px between sequence steps, 2px within chords
		return (
			keys.length * 20 +
			Math.max(0, steps.length - 1) * 4 +
			Math.max(0, keys.length - steps.length) * 2
		);
	}, [steps]);

	const keycaps =
		steps && steps.length > 0 ? (
			<ShortcutKeycaps steps={steps} className={className} />
		) : (
			<KbdKey className={cn(shortcutKbdClassName, className)}>
				{children}
			</KbdKey>
		);

	// Measure the real keycap row once mounted so multi-key labels aren't clipped.
	useLayoutEffect(() => {
		if (!revealed) {
			setContentWidth(estimatedWidth);
			return;
		}
		const el = innerRef.current;
		if (!el) {
			setContentWidth(estimatedWidth);
			return;
		}
		const next = Math.ceil(el.scrollWidth);
		setContentWidth(next > 0 ? next : estimatedWidth);
	}, [revealed, children, steps, className, estimatedWidth]);

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
									filter: "blur(5px)",
								}
					}
					animate={{
						opacity: 1,
						width: contentWidth,
						marginLeft: HINT_GAP_PX,
						filter: "blur(0px)",
					}}
					exit={{
						opacity: 0,
						width: 0,
						marginLeft: 0,
						filter: "blur(5px)",
					}}
					transition={transition}
					// Extra py so the keycap bottom shelf isn't clipped by overflow;
					// -my keeps the nav row height unchanged. Nudge up for optical align.
					// justify-start so if width is briefly short we clip the trailing key,
					// never the leading "G" of a sequence.
					className="-my-0.5 -translate-y-px inline-flex shrink-0 items-center justify-start overflow-hidden py-0.5"
				>
					<span
						ref={innerRef}
						className="inline-flex shrink-0 items-center whitespace-nowrap"
					>
						{keycaps}
					</span>
				</motion.span>
			) : null}
		</AnimatePresence>
	);
}
