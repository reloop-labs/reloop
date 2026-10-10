"use client";

import { cn } from "@reloop/ui/cn";
import Spinner from "@reloop/ui/spinner";
import {
	animate,
	motion,
	type PanInfo,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";

const KNOB_WIDTH = 136;
const TRACK_PADDING = 6;
const CONFIRM_RATIO = 0.82;
const SPRING = { type: "spring", stiffness: 520, damping: 40 } as const;

/**
 * Drag-to-confirm control for consequential grants. The deliberate gesture
 * replaces a reflex click; keyboard users press Enter/Space (or →) on the
 * knob, which runs the same slide.
 */
export function SlideToConfirm({
	label,
	pendingLabel,
	knob,
	disabled = false,
	pending = false,
	onConfirm,
}: {
	label: string;
	pendingLabel: string;
	knob: ReactNode;
	disabled?: boolean;
	pending?: boolean;
	onConfirm: () => void;
}) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [maxX, setMaxX] = useState(0);
	const x = useMotionValue(0);
	const labelOpacity = useTransform(x, [0, Math.max(maxX * 0.6, 1)], [1, 0]);
	const fillWidth = useTransform(x, (value) => value + KNOB_WIDTH);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;
		const measure = () =>
			setMaxX(Math.max(track.clientWidth - KNOB_WIDTH - TRACK_PADDING * 2, 0));
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(track);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!pending) void animate(x, 0, SPRING);
	}, [pending, x]);

	const locked = disabled || pending;

	const complete = () => {
		void animate(x, maxX, SPRING);
		onConfirm();
	};

	const handleDragEnd = (_: unknown, info: PanInfo) => {
		const travelled = x.get() + info.velocity.x * 0.05;
		if (maxX > 0 && travelled >= maxX * CONFIRM_RATIO) complete();
		else void animate(x, 0, SPRING);
	};

	return (
		<div
			ref={trackRef}
			className={cn(
				"relative h-[60px] w-full select-none overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]",
				disabled && "opacity-50",
			)}
		>
			<motion.div
				aria-hidden
				style={{ width: fillWidth }}
				className="absolute inset-y-0 left-0 rounded-full bg-bg-soft-200/70 dark:bg-white/[0.06]"
			/>
			<motion.span
				aria-hidden
				style={{ opacity: pending ? 1 : labelOpacity }}
				className="pointer-events-none absolute inset-0 flex items-center justify-center pl-[136px] font-medium text-sm text-text-sub-600"
			>
				{pending ? pendingLabel : label}
			</motion.span>
			<motion.button
				type="button"
				aria-label={`${label}. Press Enter to confirm.`}
				disabled={locked}
				drag={locked ? false : "x"}
				dragConstraints={{ left: 0, right: maxX }}
				dragElastic={0}
				dragMomentum={false}
				onDragEnd={handleDragEnd}
				onKeyDown={(event) => {
					if (locked) return;
					if (
						event.key === "Enter" ||
						event.key === " " ||
						event.key === "ArrowRight"
					) {
						event.preventDefault();
						complete();
					}
				}}
				style={{
					x,
					width: KNOB_WIDTH,
					top: TRACK_PADDING,
					left: TRACK_PADDING,
				}}
				className={cn(
					"absolute bottom-[6px] flex items-center justify-center rounded-full bg-bg-white-0 text-text-strong-950 shadow-regular-xs outline-none ring-1 ring-stroke-soft-200 ring-inset focus-visible:ring-2 focus-visible:ring-primary-base dark:bg-white dark:text-black dark:ring-0",
					locked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
				)}
			>
				{pending ? <Spinner size={16} color="currentColor" /> : knob}
			</motion.button>
		</div>
	);
}
