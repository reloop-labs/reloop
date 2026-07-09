// AlignUI Context Menu

"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@reloop/ui/cn";
import * as React from "react";
import type { PolymorphicComponentProps } from "../utils/polymorphic";
import { Icon } from "./icon";

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuCheckboxItem = ContextMenuPrimitive.CheckboxItem;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
const ContextMenuRadioItem = ContextMenuPrimitive.RadioItem;
const ContextMenuSeparator = ContextMenuPrimitive.Separator;
const ContextMenuArrow = ContextMenuPrimitive.Arrow;

const ContextMenuContent = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...rest }, forwardedRef) => (
	<ContextMenuPrimitive.Portal>
		<ContextMenuPrimitive.Content
			ref={forwardedRef}
			className={cn(
				"z-50 min-w-[180px] overflow-hidden rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50",
				"flex flex-col gap-1",
				"data-[state=open]:fade-in-0 data-[state=open]:animate-in",
				"data-[state=closed]:fade-out-0 data-[state=closed]:animate-out",
				"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
				"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
				className,
			)}
			{...rest}
		/>
	</ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

const ContextMenuItem = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
		inset?: boolean;
	}
>(({ className, inset, ...rest }, forwardedRef) => (
	<ContextMenuPrimitive.Item
		ref={forwardedRef}
		className={cn(
			"group/item relative cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950 outline-none",
			"flex items-center gap-2",
			"transition duration-200 ease-out",
			"data-[highlighted]:bg-bg-weak-50",
			"focus:outline-none",
			"data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled-300",
			inset && "pl-9",
			className,
		)}
		{...rest}
	/>
));
ContextMenuItem.displayName = "ContextMenuItem";

function ContextItemIcon<T extends React.ElementType>({
	className,
	as,
	...rest
}: PolymorphicComponentProps<T>) {
	const Component = as || "div";

	return (
		<Component
			className={cn(
				"size-5 text-text-sub-600",
				"group-has-[[data-disabled]]:text-text-disabled-300",
				className,
			)}
			{...rest}
		/>
	);
}
ContextItemIcon.displayName = "ContextItemIcon";

const ContextMenuGroup = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Group>
>(({ className, ...rest }, forwardedRef) => (
	<ContextMenuPrimitive.Group
		ref={forwardedRef}
		className={cn("flex flex-col gap-1", className)}
		{...rest}
	/>
));
ContextMenuGroup.displayName = "ContextMenuGroup";

const ContextMenuLabel = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(({ className, ...rest }, forwardedRef) => (
	<ContextMenuPrimitive.Label
		ref={forwardedRef}
		className={cn(
			"px-2 py-1 text-subheading-xs text-text-soft-400 uppercase",
			className,
		)}
		{...rest}
	/>
));
ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSubTrigger = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({ className, inset, children, ...rest }, forwardedRef) => (
	<ContextMenuPrimitive.SubTrigger
		ref={forwardedRef}
		className={cn(
			"group/item relative cursor-pointer select-none rounded-lg p-2 text-paragraph-sm text-text-strong-950 outline-0",
			"flex items-center gap-2",
			"transition duration-200 ease-out",
			"data-[highlighted]:bg-bg-weak-50",
			"data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled-300",
			inset && "pl-9",
			className,
		)}
		{...rest}
	>
		{children}
		<span className="flex-1" />
		<ContextItemIcon as={() => <Icon name="down" />} />
	</ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

const ContextMenuSubContent = React.forwardRef<
	React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...rest }, forwardedRef) => (
	<ContextMenuPrimitive.SubContent
		ref={forwardedRef}
		className={cn(
			"z-50 w-max overflow-hidden rounded-2xl bg-bg-white-0 p-2 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50",
			"flex flex-col gap-1",
			"data-[state=open]:fade-in-0 data-[state=open]:animate-in",
			"data-[state=closed]:fade-out-0 data-[state=closed]:animate-out",
			"data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
			"data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
			className,
		)}
		{...rest}
	/>
));
ContextMenuSubContent.displayName = "ContextMenuSubContent";

export {
	ContextMenu as Root,
	ContextMenuPortal as Portal,
	ContextMenuTrigger as Trigger,
	ContextMenuContent as Content,
	ContextMenuItem as Item,
	ContextItemIcon as ItemIcon,
	ContextMenuGroup as Group,
	ContextMenuLabel as Label,
	ContextMenuSub as MenuSub,
	ContextMenuSubTrigger as MenuSubTrigger,
	ContextMenuSubContent as MenuSubContent,
	ContextMenuCheckboxItem as CheckboxItem,
	ContextMenuRadioGroup as RadioGroup,
	ContextMenuRadioItem as RadioItem,
	ContextMenuSeparator as Separator,
	ContextMenuArrow as Arrow,
};
