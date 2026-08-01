"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

export type CompareFeatureSlideItem = {
	id: string;
	label: string;
	/** Optional real screenshot paths under /public. Falls back to temp mock. */
	reloopImage?: string;
	competitorImage?: string;
	/** Short caption under the mock when no image is provided */
	reloopCaption?: string;
	competitorCaption?: string;
};

/**
 * Dub-style product UI comparison:
 * feature tabs + slideable Reloop / competitor screenshots.
 */
export function CompareFeatureSlide({
	competitorName,
	competitorIcon,
	features,
	className,
}: {
	competitorName: string;
	competitorIcon: Pick<SimpleIcon, "hex" | "path">;
	features: CompareFeatureSlideItem[];
	className?: string;
}) {
	const [activeId, setActiveId] = useState(features[0]?.id ?? "");
	const active = features.find((f) => f.id === activeId) ?? features[0];

	const [position, setPosition] = useState(50);
	const [dragging, setDragging] = useState(false);
	const frameRef = useRef<HTMLDivElement>(null);
	const labelId = useId();

	// Reset slider when switching feature tabs
	useEffect(() => {
		setPosition(50);
	}, [activeId]);

	const setFromClientX = useCallback((clientX: number) => {
		const el = frameRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const next = ((clientX - rect.left) / rect.width) * 100;
		setPosition(Math.min(92, Math.max(8, next)));
	}, []);

	const onPointerDown = (e: ReactPointerEvent) => {
		e.preventDefault();
		setDragging(true);
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		setFromClientX(e.clientX);
	};

	const onPointerMove = (e: ReactPointerEvent) => {
		if (!dragging) return;
		setFromClientX(e.clientX);
	};

	const onPointerUp = (e: ReactPointerEvent) => {
		setDragging(false);
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* already released */
		}
	};

	if (!active) return null;

	return (
		<div className={cn("w-full", className)}>
			{/* Feature tabs */}
			<div className="mb-6 flex justify-center sm:mb-8">
				<div
					role="tablist"
					aria-label="Feature comparisons"
					className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-stroke-soft-200 bg-bg-weak-50/80 p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
				>
					{features.map((feature) => {
						const selected = feature.id === activeId;
						return (
							<button
								key={feature.id}
								type="button"
								role="tab"
								aria-selected={selected}
								id={`${labelId}-${feature.id}`}
								onClick={() => setActiveId(feature.id)}
								className={cn(
									"shrink-0 rounded-full px-3.5 py-2 font-medium text-[13px] transition-colors sm:px-4 sm:text-[14px]",
									selected
										? "bg-text-strong-950 text-white shadow-sm dark:bg-white dark:text-black"
										: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
								)}
							>
								{feature.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Comparison stage */}
			<div className="overflow-hidden rounded-[20px] border border-stroke-soft-200 bg-bg-weak-50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_48px_rgba(0,0,0,0.06)] sm:rounded-[24px] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_20px_48px_rgba(0,0,0,0.35)]">
				{/* Brand header row */}
				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-stroke-soft-200 border-b px-4 py-3.5 sm:px-6 sm:py-4 dark:border-white/10">
					<div className="flex items-center gap-2.5 justify-self-start">
						<div className="flex size-7 items-center justify-center rounded-lg bg-[#0a0d12] sm:size-8">
							<Logo className="[&_rect]:!fill-white size-[70%]" />
						</div>
						<span className="font-semibold text-[14px] text-text-strong-950 tracking-tight sm:text-[15px] dark:text-white">
							Reloop
						</span>
					</div>

					<span className="font-medium text-[12px] text-text-sub-600 tracking-wide dark:text-white/45">
						vs.
					</span>

					<div className="flex items-center gap-2.5 justify-self-end">
						<span className="font-semibold text-[14px] text-text-strong-950 tracking-tight sm:text-[15px] dark:text-white">
							{competitorName}
						</span>
						<div
							className="flex size-7 items-center justify-center rounded-lg sm:size-8"
							style={{ backgroundColor: `#${competitorIcon.hex}` }}
						>
							<BrandIcon
								icon={competitorIcon}
								fill="#ffffff"
								className="size-3.5 sm:size-4"
							/>
						</div>
					</div>
				</div>

				{/* Slide viewport */}
				<div
					ref={frameRef}
					className={cn(
						"relative aspect-[16/10] w-full touch-none select-none overflow-hidden bg-bg-white-0 sm:aspect-[16/9] dark:bg-black/40",
						dragging ? "cursor-ew-resize" : "cursor-col-resize",
					)}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					role="img"
					aria-label={`Slide to compare Reloop and ${competitorName} ${active.label}`}
				>
					{/* Competitor (full base layer) */}
					<div className="absolute inset-0">
						<SlidePanel
							side="competitor"
							imageSrc={active.competitorImage}
							caption={
								active.competitorCaption ??
								`${competitorName} · ${active.label}`
							}
							tint={`#${competitorIcon.hex}`}
						/>
					</div>

					{/* Reloop — clipped from the left up to the slider */}
					<div
						className="absolute inset-0"
						style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
					>
						<SlidePanel
							side="reloop"
							imageSrc={active.reloopImage}
							caption={active.reloopCaption ?? `Reloop · ${active.label}`}
							tint="#0a0d12"
						/>
					</div>

					{/* Divider + handle */}
					<div
						className="pointer-events-none absolute inset-y-0 z-20 w-px bg-stroke-soft-200 dark:bg-white/20"
						style={{ left: `${position}%` }}
					>
						<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-30">
							<div className="flex items-center gap-1.5 rounded-full bg-text-strong-950 px-3.5 py-2 font-semibold text-[12px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] sm:px-4 sm:py-2.5 sm:text-[13px] dark:bg-white dark:text-black">
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.25"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden
									className="opacity-90"
								>
									<path d="m9 18-6-6 6-6" />
									<path d="m15 6 6 6-6 6" />
								</svg>
								Slide
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function SlidePanel({
	side,
	imageSrc,
	caption,
	tint,
}: {
	side: "reloop" | "competitor";
	imageSrc?: string;
	caption: string;
	tint: string;
}) {
	if (imageSrc) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={imageSrc}
				alt={caption}
				draggable={false}
				className="size-full object-cover object-top"
			/>
		);
	}

	// Temporary mock UI panel until real screenshots land
	return (
		<div
			className={cn(
				"relative flex size-full flex-col p-4 sm:p-6",
				side === "reloop"
					? "bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-black dark:to-neutral-900"
					: "bg-gradient-to-br from-neutral-100 via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-black",
			)}
		>
			{/* Fake chrome bar */}
			<div className="mb-4 flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
				<div className="flex gap-1.5">
					<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/20" />
					<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/20" />
					<span className="size-2 rounded-full bg-stroke-soft-200 dark:bg-white/20" />
				</div>
				<div className="ml-2 h-5 flex-1 rounded-md bg-bg-weak-50 dark:bg-white/[0.06]" />
			</div>

			{/* Fake content blocks */}
			<div className="grid min-h-0 flex-1 grid-cols-3 gap-3">
				<div className="col-span-1 space-y-2.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 dark:border-white/10 dark:bg-white/[0.03]">
					<div className="h-2.5 w-2/3 rounded bg-stroke-soft-200/80 dark:bg-white/15" />
					<div className="h-2 w-full rounded bg-bg-weak-50 dark:bg-white/[0.06]" />
					<div className="h-2 w-5/6 rounded bg-bg-weak-50 dark:bg-white/[0.06]" />
					<div className="h-2 w-4/6 rounded bg-bg-weak-50 dark:bg-white/[0.06]" />
					<div className="mt-4 h-16 rounded-lg bg-bg-weak-50 dark:bg-white/[0.05]" />
					<div className="h-16 rounded-lg bg-bg-weak-50 dark:bg-white/[0.05]" />
				</div>
				<div className="col-span-2 flex flex-col rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 dark:border-white/10 dark:bg-white/[0.03]">
					<div className="mb-4 flex items-center justify-between">
						<div className="h-3 w-28 rounded bg-stroke-soft-200/80 dark:bg-white/15" />
						<div
							className="h-7 w-20 rounded-full opacity-90"
							style={{ backgroundColor: tint }}
						/>
					</div>
					<div className="flex flex-1 flex-col gap-2.5">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="flex h-10 items-center gap-3 rounded-lg border border-stroke-soft-200/70 px-3 dark:border-white/[0.07]"
							>
								<span
									className="size-6 shrink-0 rounded-md"
									style={{
										backgroundColor: tint,
										opacity: 0.15 + i * 0.08,
									}}
								/>
								<span className="h-2 flex-1 rounded bg-bg-weak-50 dark:bg-white/[0.06]" />
								<span className="h-2 w-12 rounded bg-bg-weak-50 dark:bg-white/[0.06]" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Temp label */}
			<div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
				<span className="rounded-full border border-stroke-soft-200 bg-bg-white-0/90 px-3 py-1 font-medium text-[11px] text-text-sub-600 backdrop-blur-sm dark:border-white/10 dark:bg-black/70 dark:text-white/50">
					{caption}
					<span className="ml-1.5 text-text-disabled-300 dark:text-white/30">
						· temp
					</span>
				</span>
			</div>
		</div>
	);
}
