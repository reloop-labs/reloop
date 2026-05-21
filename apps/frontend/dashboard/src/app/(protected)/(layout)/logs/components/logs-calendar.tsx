"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as React from "react";
import {
	type DayButtonProps,
	DayPicker,
	getDefaultClassNames,
} from "react-day-picker";

/**
 * Custom calendar for the logs date range filter.
 * Uses react-day-picker v9 API with proper grid layout matching the shadcn calendar style.
 * Includes month/year dropdown selectors for quick navigation.
 * This does NOT modify the global datepicker.tsx — it's a standalone component.
 */

type LogsCalendarProps = React.ComponentProps<typeof DayPicker>;

function LogsCalendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	startMonth,
	endMonth,
	...props
}: LogsCalendarProps) {
	const defaults = getDefaultClassNames();

	// Default date range for dropdowns: from 1900 to now
	const defaultStartMonth = startMonth || new Date(1900, 0);
	const defaultEndMonth = endMonth || new Date();

	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			fixedWeeks
			captionLayout={captionLayout}
			startMonth={defaultStartMonth}
			endMonth={defaultEndMonth}
			className={cn("p-2", className)}
			classNames={{
				months: cn("relative flex flex-col gap-4 md:flex-row", defaults.months),
				month: cn("flex w-full flex-col gap-4", defaults.month),
				nav: cn(
					"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
					defaults.nav,
				),
				button_previous: cn(
					"flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 p-0.5 text-text-sub-600 transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50 hover:text-text-strong-950 disabled:opacity-50",
					defaults.button_previous,
				),
				button_next: cn(
					"flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 p-0.5 text-text-sub-600 transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50 hover:text-text-strong-950 disabled:opacity-50",
					defaults.button_next,
				),
				month_caption: cn(
					"flex h-7 w-full items-center justify-center px-7",
					defaults.month_caption,
				),
				// Dropdown containers
				dropdowns: cn(
					"flex h-7 w-full items-center justify-center gap-1.5 font-medium text-sm",
					defaults.dropdowns,
				),
				dropdown_root: cn("relative rounded-md", defaults.dropdown_root),
				dropdown: cn(
					"absolute inset-0 cursor-pointer opacity-0",
					defaults.dropdown,
				),
				caption_label: cn(
					"flex select-none items-center gap-1 rounded-md font-medium text-sm text-text-strong-950",
					"[&>svg]:size-3.5 [&>svg]:text-text-soft-400",
					defaults.caption_label,
				),
				weekdays: cn("flex", defaults.weekdays),
				weekday: cn(
					"flex-1 select-none rounded-md font-normal text-[0.8rem] text-text-soft-400",
					defaults.weekday,
				),
				week: cn("mt-2 flex w-full", defaults.week),
				day: cn(
					"group/day relative aspect-square h-full w-full select-none rounded-md p-0 text-center",
					defaults.day,
				),
				range_start: cn(
					"relative isolate z-0 rounded-l-md bg-primary-alpha-10",
					defaults.range_start,
				),
				range_middle: cn("rounded-none", defaults.range_middle),
				range_end: cn(
					"relative isolate z-0 rounded-r-md bg-primary-alpha-10",
					defaults.range_end,
				),
				today: cn(
					"rounded-md bg-bg-weak-50 text-text-strong-950",
					defaults.today,
				),
				outside: cn(
					"text-text-disabled-300 aria-selected:text-text-disabled-300",
					defaults.outside,
				),
				disabled: cn("text-text-disabled-300 opacity-50", defaults.disabled),
				hidden: cn("invisible", defaults.hidden),
				...classNames,
			}}
			components={{
				Chevron: ({ orientation, size: _size }) => {
					if (orientation === "left") {
						return <Icon name="chevron-left" className="h-4 w-4" />;
					}
					if (orientation === "right") {
						return <Icon name="chevron-right" className="h-4 w-4" />;
					}
					// Down chevron for dropdowns
					return <Icon name="chevron-down" className="h-3 w-3" />;
				},
				DayButton: (buttonProps) => <LogsDayButton {...buttonProps} />,
			}}
			{...props}
		/>
	);
}

function LogsDayButton({
	className,
	day,
	modifiers,
	...props
}: DayButtonProps) {
	const ref = React.useRef<HTMLButtonElement>(null);

	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);

	return (
		<button
			ref={ref}
			type="button"
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			data-range-start={modifiers.range_start}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			className={cn(
				// base
				"relative isolate z-10 flex aspect-square size-auto w-full min-w-7 items-center justify-center rounded-md font-normal text-xs leading-none outline-none",
				"transition duration-150 ease-out",
				// hover
				"hover:bg-bg-weak-50 hover:text-text-strong-950",
				// focus
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base/50",
				// range styling
				"data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary-base data-[range-start=true]:text-white",
				"data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary-base data-[range-end=true]:text-white",
				"data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-primary-alpha-10 data-[range-middle=true]:text-text-strong-950",
				"data-[selected-single=true]:bg-primary-base data-[selected-single=true]:text-white",
				className,
			)}
			{...props}
		/>
	);
}

export { LogsCalendar };
