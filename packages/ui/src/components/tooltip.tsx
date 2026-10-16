// AlignUI Tooltip v0.0.0

"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@reloop/ui/cn";
import * as React from "react";
import { tv, type VariantProps } from "../utils/tv";
import { KbdKey } from "./kbd-key";

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
/**
 * Only keyboard focus (`:focus-visible`) opens the tooltip. Radix also opens
 * on programmatic focus, e.g. when the window regains focus with a clicked
 * button still focused, which leaves the tooltip stuck open with no
 * pointerleave to close it.
 */
const TooltipTrigger = React.forwardRef<
	React.ComponentRef<typeof TooltipPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onFocus, ...rest }, forwardedRef) => (
	<TooltipPrimitive.Trigger
		ref={forwardedRef}
		onFocus={(event) => {
			onFocus?.(event);
			if (!event.currentTarget.matches(":focus-visible"))
				event.preventDefault();
		}}
		{...rest}
	/>
));
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

export const tooltipVariants = tv({
	slots: {
		content: [
			"tooltip z-50 shadow-tooltip",
			"animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
		],
		arrow:
			"-translate-y-1/2 -rotate-45 border [clip-path:polygon(0_100%,0_0,100%_100%)]",
		shortcut: "flex shrink-0 items-center gap-0.5",
		kbd: "h-4 min-w-4 w-auto rounded-[5px] px-1 text-[10px] leading-none normal-case",
	},
	variants: {
		size: {
			xsmall: {
				content: "rounded px-1.5 py-0.5 text-paragraph-xs",
				arrow: "rounded-bl-sm",
			},
			small: {
				content: "rounded-md px-2.5 py-1 text-paragraph-sm",
				arrow: "rounded-bl-[3px]",
			},
			medium: {
				content: "rounded-xl p-3 text-label-sm",
				arrow: "rounded-bl-sm",
			},
		},
		variant: {
			dark: {
				content: "bg-bg-strong-950 text-text-white-0",
				arrow: "border-stroke-strong-950 bg-bg-strong-950",
				kbd: "border border-white/15 bg-white/10 text-text-white-0",
			},
			light: {
				content:
					"bg-bg-white-0 text-text-strong-950 ring-1 ring-stroke-soft-200",
				arrow: "border-stroke-soft-200 bg-bg-white-0",
				kbd: [
					"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
					"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
					"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
				],
			},
		},
	},
	compoundVariants: [
		{
			size: "xsmall",
			variant: "dark",
			class: {
				arrow: "size-1.5",
			},
		},
		{
			size: "xsmall",
			variant: "light",
			class: {
				arrow: "size-2",
			},
		},
		{
			size: ["small", "medium"],
			variant: "dark",
			class: {
				arrow: "size-2",
			},
		},
		{
			size: ["small", "medium"],
			variant: "light",
			class: {
				arrow: "size-2.5",
			},
		},
	],
	defaultVariants: {
		size: "small",
		variant: "dark",
	},
});

/** `mod` renders as ⌘ on Apple platforms and Ctrl elsewhere. */
function formatShortcutKey(key: string): string {
	if (key.toLowerCase() !== "mod") return key;
	return typeof navigator !== "undefined" &&
		/Mac|iPhone|iPad|iPod/.test(navigator.platform)
		? "⌘"
		: "Ctrl";
}

const TooltipContent = React.forwardRef<
	React.ComponentRef<typeof TooltipPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
		VariantProps<typeof tooltipVariants> & {
			/** Set false to hide the pointer arrow. Defaults to true. */
			showArrow?: boolean;
			/** Keyboard shortcut drawn as keycaps after the label, e.g. `["mod", "B"]`. */
			shortcut?: string[];
		}
>(
	(
		{
			size,
			variant,
			showArrow = true,
			shortcut,
			className,
			children,
			sideOffset = 4,
			...rest
		},
		forwardedRef,
	) => {
		const {
			content,
			arrow,
			shortcut: shortcutSlot,
			kbd,
		} = tooltipVariants({
			size,
			variant,
		});

		return (
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content
					ref={forwardedRef}
					sideOffset={sideOffset}
					className={content({
						class: cn(shortcut?.length && "flex items-center gap-2", className),
					})}
					{...rest}
				>
					{children}
					{shortcut?.length ? (
						<span className={shortcutSlot()}>
							{shortcut.map((key, i) => (
								<KbdKey key={`${key}-${i}`} className={kbd()}>
									{formatShortcutKey(key)}
								</KbdKey>
							))}
						</span>
					) : null}
					{showArrow ? (
						<TooltipPrimitive.Arrow asChild>
							<div className={arrow()} />
						</TooltipPrimitive.Arrow>
					) : null}
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		);
	},
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
	TooltipProvider as Provider,
	TooltipRoot as Root,
	TooltipTrigger as Trigger,
	TooltipContent as Content,
};
