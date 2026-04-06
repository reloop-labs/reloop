"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import type { DateRange } from "react-day-picker";
import { useRef, useState } from "react";
import { LogsCalendar } from "./logs-calendar";

export type LogFilterOption = "debug" | "info" | "warn" | "error" | "fatal";
export type LogFilters = LogFilterOption[];
export type StatusFilterOption = string;
export type DatePreset = {
	label: string;
	value: string;
	getRange: () => { from: Date; to: Date };
};

const LEVEL_OPTIONS: { id: LogFilterOption; label: string }[] = [
	{ id: "info", label: "Info" },
	{ id: "warn", label: "Warning" },
	{ id: "error", label: "Error" },
	{ id: "fatal", label: "Fatal" },
	{ id: "debug", label: "Debug" },
];

const STATUS_OPTIONS: {
	id: StatusFilterOption;
	label: string;
	colorClass?: string;
}[] = [
	{ id: "successes", label: "Successes", colorClass: "bg-success-base" },
	{ id: "errors", label: "Errors", colorClass: "bg-error-base" },
	{ id: "200", label: "200 - Ok", colorClass: "bg-success-base" },
	{ id: "201", label: "201 - Created", colorClass: "bg-success-base" },
	{ id: "400", label: "400 - Bad Request", colorClass: "bg-error-base" },
	{ id: "401", label: "401 - Unauthorized", colorClass: "bg-error-base" },
	{ id: "403", label: "403 - Forbidden", colorClass: "bg-error-base" },
	{ id: "404", label: "404 - Not Found", colorClass: "bg-error-base" },
	{
		id: "500",
		label: "500 - Internal Server Error",
		colorClass: "bg-error-base",
	},
];

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

export interface UnifiedLogFilters {
	levels: LogFilters;
	status: string | null;
	startDate: string | null;
	endDate: string | null;
	datePreset: string | null;
}

interface UnifiedLogFilterDropdownProps {
	value: UnifiedLogFilters;
	onChange: (value: UnifiedLogFilters) => void;
}

type FilterSection = "levels" | "status" | "date";

export const UnifiedLogFilterDropdown = ({
	value,
	onChange,
}: UnifiedLogFilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeSection, setActiveSection] = useState<FilterSection | null>(
		null,
	);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [showCalendar, setShowCalendar] = useState(false);
	const [calendarRange, setCalendarRange] = useState<DateRange | undefined>(
		value.startDate && value.endDate
			? { from: new Date(value.startDate), to: new Date(value.endDate) }
			: undefined,
	);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const activeFilterCount =
		(value.levels.length > 0 ? 1 : 0) +
		(value.status ? 1 : 0) +
		(value.startDate || value.endDate ? 1 : 0);

	const hasActiveFilter = activeFilterCount > 0;

	const handleResetAll = () => {
		onChange({
			levels: [],
			status: null,
			startDate: null,
			endDate: null,
			datePreset: null,
		});
	};

	const handleLevelToggle = (level: LogFilterOption) => {
		const newLevels = value.levels.includes(level)
			? value.levels.filter((l) => l !== level)
			: [...value.levels, level];
		onChange({ ...value, levels: newLevels });
	};

	const handleStatusSelect = (status: string | null) => {
		onChange({ ...value, status });
		setActiveSection(null);
	};

	const handleDatePresetSelect = (preset: DatePreset) => {
		const range = preset.getRange();
		onChange({
			...value,
			startDate: range.from.toISOString(),
			endDate: range.to.toISOString(),
			datePreset: preset.value,
		});
		setActiveSection(null);
	};

	const handleCalendarSelect = (range: DateRange | undefined) => {
		setCalendarRange(range);
		if (range?.from && range?.to) {
			const endOfDay = new Date(range.to);
			endOfDay.setHours(23, 59, 59, 999);
			onChange({
				...value,
				startDate: range.from.toISOString(),
				endDate: endOfDay.toISOString(),
				datePreset: null,
			});
			setActiveSection(null);
		}
	};

	const getDisplayLabel = () => {
		if (activeFilterCount === 0) return "Filter";
		if (activeFilterCount === 1) {
			if (value.levels.length > 0) return `Level (${value.levels.length})`;
			if (value.status) return "Status";
			if (value.startDate || value.endDate) return "Date";
		}
		return `Filter (${activeFilterCount})`;
	};

	const renderLevelSection = () => (
		<div className="p-3">
			<div className="mb-2 flex items-center justify-between">
				<button
					type="button"
					onClick={() => setActiveSection(null)}
					className="flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
				>
					<Icon name="chevron-left" className="h-3.5 w-3.5" />
					Back
				</button>
				<span className="text-xs font-medium text-text-sub-600">
					Filter by level
				</span>
			</div>
			<div className="relative">
				{LEVEL_OPTIONS.map((option, idx) => {
					const isChecked = value.levels.includes(option.id);
					return (
						<button
							key={option.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleLevelToggle(option.id)}
							className={cn(
								"flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-xs transition-colors",
								"text-text-strong-950",
								!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
							)}
						>
							<div
								className={cn(
									"flex h-3.5 w-3.5 items-center justify-center rounded border p-[1px] transition-colors",
									isChecked
										? "border-stroke-soft-900 bg-neutral-900"
										: "border-stroke-soft-200",
								)}
							>
								{isChecked && (
									<Icon name="check" className="h-3 w-3 text-white" />
								)}
							</div>
							<span>{option.label}</span>
						</button>
					);
				})}
				<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
			</div>
		</div>
	);

	const renderStatusSection = () => (
		<div className="p-3">
			<div className="mb-2 flex items-center justify-between">
				<button
					type="button"
					onClick={() => setActiveSection(null)}
					className="flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
				>
					<Icon name="chevron-left" className="h-3.5 w-3.5" />
					Back
				</button>
				<span className="text-xs font-medium text-text-sub-600">
					Filter by status
				</span>
			</div>
			<div className="relative">
				<button
					ref={(el) => {
						if (el) buttonRefs.current[0] = el;
					}}
					type="button"
					onPointerEnter={() => setHoverIdx(0)}
					onPointerLeave={() => setHoverIdx(undefined)}
					onClick={() => handleStatusSelect(null)}
					className={cn(
						"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
						"text-text-strong-950",
						!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
					)}
				>
					<div className="flex items-center gap-3">
						<div className="flex h-3.5 w-3.5 items-center justify-center">
							<div className="h-2 w-2 rounded-full border-2 border-text-strong-950" />
						</div>
						<span className={cn(!value.status && "font-medium")}>
							All Statuses
						</span>
					</div>
					{!value.status && (
						<Icon name="check" className="h-4 w-4 text-text-strong-950" />
					)}
				</button>

				<div className="my-1 border-t border-stroke-soft-200" />

				{STATUS_OPTIONS.slice(0, 2).map((option, idx) => {
					const isChecked = value.status === option.id;
					const index = idx + 1;
					return (
						<button
							key={option.id}
							ref={(el) => {
								if (el) buttonRefs.current[index] = el;
							}}
							type="button"
							onPointerEnter={() => setHoverIdx(index)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onClick={() => handleStatusSelect(option.id)}
							className={cn(
								"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
								"text-text-strong-950",
								!currentRect && hoverIdx === index && "bg-neutral-alpha-10",
							)}
						>
							<div className="flex items-center gap-3">
								<div className="flex h-3.5 w-3.5 items-center justify-center">
									<div
										className={cn("h-2 w-2 rounded-full", option.colorClass)}
									/>
								</div>
								<span
									className={cn(isChecked && "font-medium text-primary-base")}
								>
									{option.label}
								</span>
							</div>
							{isChecked && (
								<Icon name="check" className="h-4 w-4 text-primary-base" />
							)}
						</button>
					);
				})}

				<div className="my-1 border-t border-stroke-soft-200" />

				<div className="max-h-[200px] overflow-y-auto pr-1">
					{STATUS_OPTIONS.slice(2).map((option, idx) => {
						const isChecked = value.status === option.id;
						const index = idx + 3;
						return (
							<button
								key={option.id}
								ref={(el) => {
									if (el) buttonRefs.current[index] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(index)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleStatusSelect(option.id)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
									"text-text-strong-950",
									!currentRect && hoverIdx === index && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-3">
									<div className="flex h-3.5 w-3.5 items-center justify-center">
										<div
											className={cn("h-2 w-2 rounded-full", option.colorClass)}
										/>
									</div>
									<span
										className={cn(isChecked && "font-medium text-primary-base")}
									>
										{option.label}
									</span>
								</div>
								{isChecked && (
									<Icon name="check" className="h-4 w-4 text-primary-base" />
								)}
							</button>
						);
					})}
				</div>

				<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
			</div>
		</div>
	);

	const renderDateSection = () => {
		if (showCalendar) {
			return (
				<div className="p-4">
					<div className="mb-3 flex items-center justify-between">
						<button
							type="button"
							onClick={() => setShowCalendar(false)}
							className="flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
						>
							<Icon name="chevron-left" className="h-3.5 w-3.5" />
							Back to presets
						</button>
						{calendarRange?.from && calendarRange?.to && (
							<span className="text-text-sub-600 text-xs">
								{calendarRange.from.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}{" "}
								–{" "}
								{calendarRange.to.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</span>
						)}
					</div>
					<LogsCalendar
						mode="range"
						selected={calendarRange}
						onSelect={handleCalendarSelect}
						numberOfMonths={2}
						disabled={{ after: new Date() }}
					/>
				</div>
			);
		}

		return (
			<div className="p-3">
				<div className="mb-2 flex items-center justify-between">
					<button
						type="button"
						onClick={() => setActiveSection(null)}
						className="flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
					>
						<Icon name="chevron-left" className="h-3.5 w-3.5" />
						Back
					</button>
					<span className="text-xs font-medium text-text-sub-600">
						Time range
					</span>
				</div>
				<div className="relative">
					{DATE_PRESETS.map((preset, idx) => {
						const isActive = value.datePreset === preset.value;
						return (
							<button
								key={preset.value}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleDatePresetSelect(preset)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between rounded-lg px-1 py-1.5 text-xs transition-colors",
									isActive
										? "font-medium text-primary-base"
										: "text-text-strong-950",
									!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
								)}
							>
								<span>{preset.label}</span>
								{isActive && (
									<Icon
										name="check"
										className="h-3.5 w-3.5 text-primary-base"
									/>
								)}
							</button>
						);
					})}

					<div className="my-1 border-t border-stroke-soft-200" />
					<button
						ref={(el) => {
							if (el) buttonRefs.current[DATE_PRESETS.length] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(DATE_PRESETS.length)}
						onPointerLeave={() => setHoverIdx(undefined)}
						onClick={() => setShowCalendar(true)}
						className={cn(
							"flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-xs transition-colors",
							"text-text-strong-950",
							!currentRect &&
								hoverIdx === DATE_PRESETS.length &&
								"bg-neutral-alpha-10",
						)}
					>
						<Icon name="calendar" className="h-3.5 w-3.5 text-text-sub-600" />
						<span>Custom range...</span>
					</button>

					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</div>
		);
	};

	const renderMainContent = () => (
		<div className="w-64 p-3">
			<div className="mb-3 flex items-center justify-between border-b border-stroke-soft-200 pb-2">
				<span className="font-medium text-text-sub-600 text-xs">Filters</span>
				{hasActiveFilter && (
					<button
						type="button"
						onClick={handleResetAll}
						className="rounded-lg border border-stroke-soft-200 px-2 py-1 text-xs text-text-sub-600 transition-colors hover:bg-bg-weak-50"
					>
						Reset all
					</button>
				)}
			</div>

			<div className="relative space-y-1">
				<button
					ref={(el) => {
						if (el) buttonRefs.current[0] = el;
					}}
					type="button"
					onPointerEnter={() => setHoverIdx(0)}
					onPointerLeave={() => setHoverIdx(undefined)}
					onClick={() => setActiveSection("levels")}
					className={cn(
						"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors",
						"text-text-strong-950",
						!currentRect && hoverIdx === 0 && "bg-neutral-alpha-10",
					)}
				>
					<div className="flex items-center gap-3">
						<Icon name="layers" className="h-4 w-4 text-text-sub-600" />
						<span
							className={cn(
								value.levels.length > 0 && "font-medium text-primary-base",
							)}
						>
							Level {value.levels.length > 0 && `(${value.levels.length})`}
						</span>
					</div>
					<div className="flex items-center gap-2">
						{value.levels.length > 0 && (
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-base text-[10px] text-white">
								{value.levels.length}
							</span>
						)}
						<Icon
							name="chevron-right"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
					</div>
				</button>

				<button
					ref={(el) => {
						if (el) buttonRefs.current[1] = el;
					}}
					type="button"
					onPointerEnter={() => setHoverIdx(1)}
					onPointerLeave={() => setHoverIdx(undefined)}
					onClick={() => setActiveSection("status")}
					className={cn(
						"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors",
						"text-text-strong-950",
						!currentRect && hoverIdx === 1 && "bg-neutral-alpha-10",
					)}
				>
					<div className="flex items-center gap-3">
						<Icon name="check-circle" className="h-4 w-4 text-text-sub-600" />
						<span
							className={cn(value.status && "font-medium text-primary-base")}
						>
							Status{" "}
							{value.status &&
								`(${STATUS_OPTIONS.find((s) => s.id === value.status)?.label})`}
						</span>
					</div>
					<Icon
						name="chevron-right"
						className="h-3.5 w-3.5 text-text-sub-600"
					/>
				</button>

				<button
					ref={(el) => {
						if (el) buttonRefs.current[2] = el;
					}}
					type="button"
					onPointerEnter={() => setHoverIdx(2)}
					onPointerLeave={() => setHoverIdx(undefined)}
					onClick={() => setActiveSection("date")}
					className={cn(
						"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors",
						"text-text-strong-950",
						!currentRect && hoverIdx === 2 && "bg-neutral-alpha-10",
					)}
				>
					<div className="flex items-center gap-3">
						<Icon name="calendar" className="h-4 w-4 text-text-sub-600" />
						<span
							className={cn(
								(value.startDate || value.endDate) &&
									"font-medium text-primary-base",
							)}
						>
							Date{" "}
							{value.datePreset &&
								`(${DATE_PRESETS.find((p) => p.value === value.datePreset)?.label})`}
						</span>
					</div>
					<Icon
						name="chevron-right"
						className="h-3.5 w-3.5 text-text-sub-600"
					/>
				</button>

				<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
			</div>
		</div>
	);

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className={cn(
						"gap-1.5 whitespace-nowrap",
						hasActiveFilter &&
							"border-primary-base/30 bg-primary-alpha-10 text-primary-base",
					)}
				>
					<Icon name="filter" className="h-4 w-4" />
					<span>{getDisplayLabel()}</span>
					{hasActiveFilter && (
						<span className="-top-1.5 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
							{activeFilterCount}
						</span>
					)}
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="p-0">
				{activeSection === "levels" && renderLevelSection()}
				{activeSection === "status" && renderStatusSection()}
				{activeSection === "date" && renderDateSection()}
				{!activeSection && renderMainContent()}
			</Dropdown.Content>
		</Dropdown.Root>
	);
};
