"use client";

import { cn } from "@reloop/ui/cn";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import type * as React from "react";

function Command({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive>) {
	return (
		<CommandPrimitive
			className={cn(
				"flex h-full w-full flex-col overflow-hidden rounded-md bg-bg-white-0 text-text-strong-950",
				className,
			)}
			{...props}
		/>
	);
}

function CommandInput({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
	return (
		<div
			className="flex items-center gap-2 border-stroke-soft-100 border-b px-3 dark:border-stroke-soft-100/40"
			cmdk-input-wrapper=""
		>
			<Search className="size-4 shrink-0 opacity-50" />
			<CommandPrimitive.Input
				className={cn(
					"flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-text-soft-400 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			className={cn(
				"max-h-[300px] overflow-y-auto overflow-x-hidden",
				className,
			)}
			{...props}
		/>
	);
}

function CommandEmpty({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			className={cn("py-6 text-center text-sm text-text-sub-600", className)}
			{...props}
		/>
	);
}

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			className={cn(
				"overflow-hidden p-1 text-text-strong-950 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-sub-600 [&_[cmdk-group-heading]]:text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			className={cn(
				"-mx-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40",
				className,
			)}
			{...props}
		/>
	);
}

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			className={cn(
				"relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-bg-weak-50 data-[selected=true]:text-text-strong-950 data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
};
