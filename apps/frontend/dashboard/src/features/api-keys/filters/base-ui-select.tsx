"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@reloop/ui/cn";
import { cva, type VariantProps } from "class-variance-authority";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import * as React from "react";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

export const Select: typeof SelectPrimitive.Root = SelectPrimitive.Root;

export const selectTriggerVariants = cva(
	"relative inline-flex min-h-9 w-full min-w-36 select-none items-center justify-between gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 text-left text-sm text-text-strong-950 shadow-none outline-none transition-colors pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 hover:bg-bg-weak-50/60 focus:outline-none data-disabled:pointer-events-none data-disabled:opacity-64 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/40 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		defaultVariants: {
			size: "default",
		},
		variants: {
			size: {
				default: "",
				lg: "min-h-10 sm:min-h-9",
				sm: "min-h-8 gap-1.5 px-2.5 sm:min-h-7",
			},
		},
	},
);

export const selectTriggerIconClassName = "-me-1 size-4 opacity-70";

export interface SelectButtonProps extends useRender.ComponentProps<"button"> {
	size?: VariantProps<typeof selectTriggerVariants>["size"];
}

export function SelectButton({
	className,
	size,
	render,
	children,
	...props
}: SelectButtonProps): React.ReactElement {
	const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
		render ? undefined : "button";

	const defaultProps = {
		children: (
			<>
				<span className="flex-1 truncate in-data-placeholder:text-text-sub-600">
					{children}
				</span>
				<ChevronsUpDownIcon className={selectTriggerIconClassName} />
			</>
		),
		className: cn(selectTriggerVariants({ size }), "min-w-0", className),
		"data-slot": "select-button",
		type: typeValue,
	};

	return useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(defaultProps, props),
		render,
	});
}

export function SelectTrigger({
	className,
	size = "default",
	children,
	...props
}: SelectPrimitive.Trigger.Props &
	VariantProps<typeof selectTriggerVariants>): React.ReactElement {
	return (
		<SelectPrimitive.Trigger
			className={cn(selectTriggerVariants({ size }), className)}
			data-slot="select-trigger"
			{...props}
		>
			{children}
			<SelectPrimitive.Icon data-slot="select-icon">
				<ChevronsUpDownIcon className={selectTriggerIconClassName} />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

export function SelectValue({
	className,
	...props
}: SelectPrimitive.Value.Props): React.ReactElement {
	return (
		<SelectPrimitive.Value
			className={cn(
				// flex so leading icons inside Value share the same left edge as ItemText
				// (alignItemWithTrigger lines Value up with ItemText)
				"flex min-w-0 flex-1 items-center gap-2 font-medium text-sm text-text-strong-950 data-placeholder:text-text-sub-600",
				className,
			)}
			data-slot="select-value"
			{...props}
		/>
	);
}

export function SelectPopup({
	className,
	children,
	side = "bottom",
	sideOffset = 4,
	align = "start",
	// Ignored while alignItemWithTrigger is active (Base UI aligns Value ↔ ItemText).
	alignOffset = 0,
	alignItemWithTrigger = true,
	anchor,
	portalProps,
	...props
}: SelectPrimitive.Popup.Props & {
	portalProps?: SelectPrimitive.Portal.Props;
	side?: SelectPrimitive.Positioner.Props["side"];
	sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"];
	align?: SelectPrimitive.Positioner.Props["align"];
	alignOffset?: SelectPrimitive.Positioner.Props["alignOffset"];
	alignItemWithTrigger?: SelectPrimitive.Positioner.Props["alignItemWithTrigger"];
	anchor?: SelectPrimitive.Positioner.Props["anchor"];
}): React.ReactElement {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const listRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<HTMLElement[]>([]);

	const currentTab =
		hoverIdx !== undefined ? itemRefs.current[hoverIdx] : undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	const childrenWithProps = React.Children.map(children, (child, idx) => {
		if (React.isValidElement(child)) {
			return React.cloneElement(child as React.ReactElement<any>, {
				ref: (el: HTMLElement | null) => {
					if (el) itemRefs.current[idx] = el;
				},
				onPointerEnter: () => setHoverIdx(idx),
				onPointerLeave: () => setHoverIdx(undefined),
			});
		}
		return child;
	});

	return (
		<SelectPrimitive.Portal {...portalProps}>
			<SelectPrimitive.Positioner
				align={align}
				alignItemWithTrigger={alignItemWithTrigger}
				alignOffset={alignOffset}
				anchor={anchor}
				className="z-50 select-none"
				data-slot="select-positioner"
				side={side}
				sideOffset={sideOffset}
			>
				<SelectPrimitive.Popup
					className="origin-(--transform-origin) text-text-strong-950 outline-none"
					data-slot="select-popup"
					{...props}
				>
					<SelectPrimitive.ScrollUpArrow
						className="top-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-[200%] before:rounded-t-xl before:bg-bg-white-0 dark:before:bg-bg-weak-50"
						data-slot="select-scroll-up-arrow"
					>
						<ChevronUpIcon className="relative size-4 sm:size-4" />
					</SelectPrimitive.ScrollUpArrow>
					<div
						ref={listRef}
						className="relative h-full min-w-(--anchor-width) rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-none dark:border-stroke-soft-100/50 dark:bg-bg-weak-50"
					>
						<SelectPrimitive.List
							className={cn(
								"relative max-h-(--available-height) space-y-0.5 overflow-y-auto",
								className,
							)}
							data-slot="select-list"
						>
							{childrenWithProps}
							<AnimatedHoverBackground
								rect={currentRect}
								tabElement={currentTab}
							/>
						</SelectPrimitive.List>
					</div>
					<SelectPrimitive.ScrollDownArrow
						className="bottom-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:bottom-px before:h-[200%] before:rounded-b-xl before:bg-bg-white-0 dark:before:bg-bg-weak-50"
						data-slot="select-scroll-down-arrow"
					>
						<ChevronDownIcon className="relative size-4 sm:size-4" />
					</SelectPrimitive.ScrollDownArrow>
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

export const SelectItem = React.forwardRef<
	HTMLDivElement,
	SelectPrimitive.Item.Props & {
		onPointerEnter?: () => void;
		onPointerLeave?: () => void;
	}
>(({ className, children, onPointerEnter, onPointerLeave, ...props }, ref) => {
	return (
		<SelectPrimitive.Item
			ref={ref}
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			className={cn(
				// pr-8 reserves room for the absolutely-positioned check so selected
				// and unselected rows share the same content width/alignment
				"relative z-10 flex min-h-8 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 pr-8 text-sm text-text-strong-950 outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-64",
				className,
			)}
			data-slot="select-item"
			{...props}
		>
			{/* ItemText left edge is what alignItemWithTrigger lines up with Select.Value */}
			<SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2">
				{children}
			</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-text-strong-950">
				<svg
					aria-hidden="true"
					fill="none"
					height="16"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					viewBox="0 0 24 24"
					width="16"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
				</svg>
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
});
SelectItem.displayName = "SelectItem";

export function SelectSeparator({
	className,
	...props
}: SelectPrimitive.Separator.Props): React.ReactElement {
	return (
		<SelectPrimitive.Separator
			className={cn(
				"mx-2 my-1 h-px bg-stroke-soft-200 dark:bg-stroke-soft-100/50",
				className,
			)}
			data-slot="select-separator"
			{...props}
		/>
	);
}

export function SelectGroup(
	props: SelectPrimitive.Group.Props,
): React.ReactElement {
	return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

export function SelectLabel({
	className,
	...props
}: SelectPrimitive.Label.Props): React.ReactElement {
	return (
		<SelectPrimitive.Label
			className={cn(
				"not-in-data-[slot=field]:mb-2 inline-flex cursor-default items-center gap-2 font-medium text-sm text-text-strong-950",
				className,
			)}
			data-slot="select-label"
			{...props}
		/>
	);
}

export function SelectGroupLabel(
	props: SelectPrimitive.GroupLabel.Props,
): React.ReactElement {
	return (
		<SelectPrimitive.GroupLabel
			className="px-2 py-1.5 font-medium text-text-sub-600 text-xs"
			data-slot="select-group-label"
			{...props}
		/>
	);
}

export { SelectPrimitive, SelectPopup as SelectContent };
