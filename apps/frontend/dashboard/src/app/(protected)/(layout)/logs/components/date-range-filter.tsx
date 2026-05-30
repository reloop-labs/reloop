"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Popover from "@reloop/ui/popover";
import { useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { LogsCalendar } from "./logs-calendar";

export type DatePreset = {
	label: string;
	value: string;
	getRange: () => { from: Date; to: Date };
};

const DATE_PRESETS: DatePreset[] = [
	{
		label: "Last 1 hour",
		value: "1h",
		getRange: () => ({
			from: new Date(Date.now() - 60 * 60 * 1000),
			to: new Date(),
		}),
	},
	{
		label: "Last 24 hours",
		value: "24h",
		getRange: () => ({
			from: new Date(Date.now() - 24 * 60 * 60 * 1000),
			to: new Date(),
		}),
	},
	{
		label: "Last 7 days",
		value: "7d",
		getRange: () => ({
			from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
			to: new Date(),
		}),
	},
	{
		label: "Last 30 days",
		value: "30d",
		getRange: () => ({
			from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			to: new Date(),
		}),
	},
	{
		label: "Last 3 months",
		value: "90d",
		getRange: () => ({
			from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
			to: new Date(),
		}),
	},
	{
		label: "Last 6 months",
		value: "180d",
		getRange: () => ({
			from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
			to: new Date(),
		}),
	},
];

interface DateRangeFilterProps {
	startDate: string | null;
	endDate: string | null;
	activePreset: string | null;
	onDateChange: (
		startDate: string | null,
		endDate: string | null,
		preset: string | null,
	) => void;
	numberOfMonths?: number;
}

export const DateRangeFilter = ({
	startDate,
	endDate,
	activePreset,
	onDateChange,
	numberOfMonths = 2,
}: DateRangeFilterProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	// Sync internal range with props when they change
	const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(
		startDate && endDate
			? { from: new Date(startDate), to: new Date(endDate) }
			: undefined,
	);

	// Update internal state when props change (e.g. from presets)
	useEffect(() => {
		if (startDate && endDate) {
			setCalendarRange({ from: new Date(startDate), to: new Date(endDate) });
		} else {
			setCalendarRange(undefined);
		}
	}, [startDate, endDate]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const activePresetLabel =
		DATE_PRESETS.find((p) => p.value === activePreset)?.label || null;

	const hasActiveFilter = startDate || endDate;

	const formatDisplayLabel = () => {
		if (activePresetLabel) return activePresetLabel;
		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
		}
		return "All time";
	};

	const handlePresetSelect = (preset: DatePreset) => {
		const range = preset.getRange();
		onDateChange(
			range.from.toISOString(),
			range.to.toISOString(),
			preset.value,
		);
		setIsOpen(false);
	};

	const handleCalendarSelect = (range: DateRange | undefined) => {
		setCalendarRange(range);
	};

	const handleApply = () => {
		if (calendarRange?.from && calendarRange?.to) {
			const endOfDay = new Date(calendarRange.to);
			endOfDay.setHours(23, 59, 59, 999);
			onDateChange(
				calendarRange.from.toISOString(),
				endOfDay.toISOString(),
				null,
			);
			setIsOpen(false);
		}
	};

	const handleClear = () => {
		onDateChange(null, null, null);
		setCalendarRange(undefined);
		setIsOpen(false);
	};

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"gap-1.5 whitespace-nowrap rounded-xl",
						hasActiveFilter &&
							"border-stroke-soft-900 bg-neutral-alpha-10 text-text-strong-950",
					)}
				>
					<Button.Icon>
						<Icon name="calendar" className="h-4 w-4" />
					</Button.Icon>
					{formatDisplayLabel()}
					<Button.Icon>
						<Icon name="chevron-down" className="h-3.5 w-3.5" />
					</Button.Icon>
				</Button.Root>
			</Popover.Trigger>

			<Popover.Content align="start" showArrow={false} className="w-auto p-0">
				<div className="flex divide-x divide-stroke-soft-200">
					{/* Left: Presets */}
					<div className="w-44 px-2">
						{hasActiveFilter && (
							<div className="mb-2 flex items-center justify-end border-stroke-soft-200 border-b px-1 pb-2">
								<button
									type="button"
									onClick={handleClear}
									className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-text-sub-600 text-xs transition-colors hover:bg-bg-weak-50"
								>
									Reset
								</button>
							</div>
						)}

						<div className="relative mt-2">
							{DATE_PRESETS.map((preset, idx) => {
								const isActive = activePreset === preset.value;
								return (
									<button
										key={preset.value}
										ref={(el) => {
											if (el) buttonRefs.current[idx] = el;
										}}
										type="button"
										onPointerEnter={() => setHoverIdx(idx)}
										onPointerLeave={() => setHoverIdx(undefined)}
										onClick={() => handlePresetSelect(preset)}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
											isActive
												? "bg-neutral-alpha-10 font-medium text-text-strong-950"
												: "text-text-strong-950",
											!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
										)}
									>
										<span>{preset.label}</span>
										{isActive && (
											<Icon
												name="check"
												className="h-3.5 w-3.5 text-text-strong-950"
											/>
										)}
									</button>
								);
							})}

							<AnimatedHoverBackground
								rect={currentRect}
								tabElement={currentTab}
							/>
						</div>
					</div>

					{/* Right: Calendar */}
					<div className="p-2">
						<LogsCalendar
							mode="range"
							selected={calendarRange}
							onSelect={handleCalendarSelect}
							numberOfMonths={numberOfMonths}
							disabled={{ after: new Date() }}
						/>
						<div className="flex justify-end gap-2 border-stroke-soft-100 border-t pt-2">
							{(hasActiveFilter ||
								!!calendarRange?.from ||
								!!calendarRange?.to) && (
								<Button.Root
									size="xsmall"
									variant="neutral"
									mode="stroke"
									className="rounded-xl"
									onClick={handleClear}
								>
									Reset
								</Button.Root>
							)}
							<Button.Root
								size="xsmall"
								variant="neutral"
								className="rounded-xl"
								onClick={handleApply}
								disabled={!calendarRange?.from || !calendarRange?.to}
							>
								Apply
							</Button.Root>
						</div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};
