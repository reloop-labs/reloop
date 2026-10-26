"use client";

import { cn } from "@reloop/ui/cn";
import * as Modal from "@reloop/ui/modal";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { CalendarClock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useEngagementQuery } from "#/features/metrics/hooks/use-engagement-query";
import { scheduleCampaignRequest } from "../../campaigns-api";
import { nextSlot } from "../../utils";
import { useCampaignEditorStore } from "../campaign-editor-store";
import { useDeliveryBreakdown } from "./campaign-send-modal";

interface CampaignScheduleModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignId: string;
	onScheduled?: () => void;
}

/** Monday first, matching the engagement heatmap rows. */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_NAMES = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;
const PRESET_HOURS = [8, 9, 12, 18];
/** Mini heatmap rows: 3-hour blocks from 6 AM; night folds into the first. */
const DOT_ROWS = 6;

function formatHour(hour: number): string {
	const date = new Date();
	date.setHours(hour, 0, 0, 0);
	return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatHourShort(hour: number): string {
	const date = new Date();
	date.setHours(hour, 0, 0, 0);
	return date.toLocaleTimeString([], { hour: "numeric" });
}

function dotRow(hour: number): number {
	return Math.min(DOT_ROWS - 1, Math.max(0, Math.floor((hour - 6) / 3)));
}

function BestTimeDots({
	heatmap,
	best,
}: {
	heatmap: number[][] | null;
	best: { day: number; hour: number } | null;
}) {
	const grid = useMemo(() => {
		const cells = Array.from({ length: 7 }, () =>
			Array<number>(DOT_ROWS).fill(0),
		);
		heatmap?.forEach((hours, day) => {
			hours.forEach((count, hour) => {
				const row = cells[day];
				if (row) row[dotRow(hour)] = (row[dotRow(hour)] ?? 0) + count;
			});
		});
		return cells;
	}, [heatmap]);
	const max = Math.max(1, ...grid.flat());

	return (
		<div className="flex shrink-0 flex-col items-center gap-1.5" aria-hidden>
			<div className="grid grid-flow-col grid-cols-7 grid-rows-6 gap-[5px]">
				{grid.map((rows, day) =>
					rows.map((count, row) => {
						const isBest =
							best !== null && best.day === day && dotRow(best.hour) === row;
						return (
							<span
								key={`${day}-${row}`}
								className={cn(
									"size-[7px] rounded-full bg-text-strong-950",
									isBest &&
										"ring-2 ring-text-strong-950/30 ring-offset-1 ring-offset-bg-weak-50",
								)}
								style={{
									opacity: isBest ? 1 : 0.14 + 0.5 * (count / max),
								}}
							/>
						);
					}),
				)}
			</div>
			<div className="grid grid-cols-7 gap-[5px] text-[9px] text-text-soft-400 leading-none">
				{DAYS.map((label, day) => (
					<span
						key={label}
						className={cn(
							"w-[7px] text-center",
							best?.day === day && "font-semibold text-text-strong-950",
						)}
					>
						{label[0]}
					</span>
				))}
			</div>
		</div>
	);
}

export function CampaignScheduleModal({
	open,
	onOpenChange,
	campaignId,
	onScheduled,
}: CampaignScheduleModalProps) {
	const router = useRouter();
	const { subject, fromEmail } = useCampaignEditorStore();
	const breakdown = useDeliveryBreakdown();
	const engagement = useEngagementQuery({ enabled: open });
	const best = engagement.data?.bestTime.best ?? null;

	const [day, setDay] = useState<number | null>(null);
	const [hour, setHour] = useState<number | null>(null);
	const [isScheduling, setIsScheduling] = useState(false);

	// Start on the readers' best time once it loads; no guess without data.
	useEffect(() => {
		if (!open || !best) return;
		setDay((current) => current ?? best.day);
		setHour((current) => current ?? best.hour);
	}, [open, best]);

	useEffect(() => {
		if (!open) {
			setDay(null);
			setHour(null);
		}
	}, [open]);

	const hours = useMemo(() => {
		const set = new Set(PRESET_HOURS);
		if (best) set.add(best.hour);
		if (hour !== null) set.add(hour);
		return [...set].sort((a, b) => a - b);
	}, [best, hour]);

	const slot = day !== null && hour !== null ? nextSlot(day, hour) : null;
	const missing = [
		!fromEmail.trim() && "a From address",
		!subject.trim() && "a subject",
	]
		.filter(Boolean)
		.join(" and ");
	const canSchedule = slot !== null && !missing && !isScheduling;

	const handleSchedule = async () => {
		if (!slot || !canSchedule) return;
		setIsScheduling(true);
		try {
			await scheduleCampaignRequest(campaignId, slot.toISOString());
			toast.success(
				`Scheduled for ${slot.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}, ${formatHour(slot.getHours())}`,
			);
			// Navigating away unmounts the dialog. Closing it first would
			// rewrite ?modal= and cancel this navigation.
			onScheduled?.();
			router.push(`/campaigns/${campaignId}`);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to schedule campaign",
			);
		} finally {
			setIsScheduling(false);
		}
	};

	const pill =
		"rounded-xl px-3 py-2 font-medium text-sm transition-colors active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-text-strong-950/40";
	const selected = "bg-bg-strong-950 text-text-white-0";

	return (
		<Modal.Root
			open={open}
			onOpenChange={(o) => !isScheduling && onOpenChange(o)}
		>
			<Modal.Content
				className="rounded-[24px] border border-stroke-soft-200 bg-bg-white-0 p-5 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
				showClose={false}
			>
				<Modal.Title className="font-semibold text-text-strong-950 text-xl tracking-tight">
					Schedule
				</Modal.Title>
				<Modal.Description className="mt-1 text-sm text-text-sub-600">
					{breakdown.isLoading ? (
						<Skeleton className="inline-block h-4 w-56 rounded align-middle" />
					) : (
						<>
							Goes out to {(breakdown.sendable ?? 0).toLocaleString()}{" "}
							{breakdown.sendable === 1 ? "contact" : "contacts"}. You can keep
							editing until then.
						</>
					)}
				</Modal.Description>

				<div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-bg-weak-50 p-4">
					<div className="min-w-0">
						<p className="flex items-center gap-1.5 text-sm text-text-sub-600">
							<Sparkles className="size-4" strokeWidth={1.75} />
							Best time to send
						</p>
						<p className="mt-2 font-medium text-[15px] text-text-strong-950 leading-snug">
							{engagement.isPending ? (
								<Skeleton className="h-5 w-52 rounded" />
							) : best ? (
								<>
									Your readers open most on {DAY_NAMES[best.day]} around{" "}
									{formatHourShort(best.hour)}
								</>
							) : (
								"Not enough opens yet to suggest a time"
							)}
						</p>
					</div>
					<BestTimeDots
						heatmap={engagement.data?.bestTime.heatmap ?? null}
						best={best}
					/>
				</div>

				<p className="mt-5 text-sm text-text-sub-600">Day</p>
				<fieldset
					className="mt-2 grid grid-cols-7 gap-1 border-0 p-0"
					aria-label="Day"
				>
					{DAYS.map((label, index) => (
						<button
							key={label}
							type="button"
							aria-pressed={day === index}
							onClick={() => setDay(index)}
							className={cn(
								pill,
								"px-0 py-2.5",
								day === index
									? selected
									: "text-text-sub-600 hover:text-text-strong-950",
							)}
						>
							{label}
						</button>
					))}
				</fieldset>

				<p className="mt-4 text-sm text-text-sub-600">Time</p>
				<fieldset
					className="mt-2 flex flex-wrap gap-2 border-0 p-0"
					aria-label="Time"
				>
					{hours.map((h) => (
						<button
							key={h}
							type="button"
							aria-pressed={hour === h}
							onClick={() => setHour(h)}
							className={cn(
								pill,
								"rounded-full border px-4",
								hour === h
									? cn(selected, "border-transparent")
									: "border-stroke-soft-200 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/40",
							)}
						>
							{formatHour(h)}
						</button>
					))}
				</fieldset>

				<div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-bg-weak-50 px-4 py-3 text-sm">
					<span className="font-medium text-text-strong-950">
						{slot
							? `${DAYS[day ?? 0]}, ${formatHour(slot.getHours())}`
							: "Pick a day and time"}
					</span>
					{slot ? (
						<span className="text-text-soft-400 tabular-nums">
							{slot.toLocaleDateString([], { day: "numeric", month: "short" })}
						</span>
					) : null}
				</div>

				{missing ? (
					<p className="mt-3 text-[12px] text-text-sub-600">
						Add {missing} before scheduling.
					</p>
				) : null}

				<div className="mt-5 flex justify-end gap-2">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						disabled={isScheduling}
						className={cn(
							pill,
							"border border-stroke-soft-200 px-5 text-text-strong-950 hover:bg-bg-weak-50 disabled:opacity-50 dark:border-stroke-soft-100/40",
						)}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => void handleSchedule()}
						disabled={!canSchedule}
						title={missing ? `Add ${missing} first` : undefined}
						className={cn(
							pill,
							selected,
							"flex items-center gap-2 px-5 disabled:opacity-40",
						)}
					>
						{isScheduling ? (
							<Spinner className="size-4" />
						) : (
							<CalendarClock className="size-4" strokeWidth={1.75} />
						)}
						Schedule
					</button>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
