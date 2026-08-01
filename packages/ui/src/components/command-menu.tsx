// AlignUI CommandMenu v0.0.0

"use client";

import type { DialogProps } from "@radix-ui/react-dialog";
import { cn } from "@reloop/ui/cn";
import { Command } from "cmdk";
import * as React from "react";
import type { PolymorphicComponentProps } from "../utils/polymorphic";
import { tv, type VariantProps } from "../utils/tv";
import * as Modal from "./modal";

const CommandDialogTitle = Modal.Title;
const CommandDialogDescription = Modal.Description;

const CommandDialog = ({
	children,
	className,
	overlayClassName,
	...rest
}: DialogProps & {
	className?: string;
	overlayClassName?: string;
}) => {
	return (
		<Modal.Root {...rest}>
			<Modal.Content
				overlayClassName={cn("justify-center", overlayClassName)}
				showClose={false}
				className={cn(
					"flex max-h-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 shadow-2xl dark:border-white/10",
					className,
				)}
			>
				<Command className={cn("grid min-h-0 auto-cols-auto grid-flow-row")}>
					{children}
				</Command>
			</Modal.Content>
		</Modal.Root>
	);
};

const CommandInput = React.forwardRef<
	React.ComponentRef<typeof Command.Input>,
	React.ComponentPropsWithoutRef<typeof Command.Input>
>(({ className, ...rest }, forwardedRef) => {
	return (
		<Command.Input
			ref={forwardedRef}
			className={cn(
				// base
				"w-full bg-transparent text-paragraph-sm text-text-strong-950 outline-none",
				"transition duration-200 ease-out",
				// placeholder
				"placeholder:[transition:inherit]",
				"placeholder:text-text-soft-400",
				// hover
				"group-hover/cmd-input:placeholder:text-text-sub-600",
				// focus
				"focus:outline-none",
				className,
			)}
			{...rest}
		/>
	);
});
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
	React.ComponentRef<typeof Command.List>,
	React.ComponentPropsWithoutRef<typeof Command.List>
>(({ className, ...rest }, forwardedRef) => {
	return (
		<Command.List
			ref={forwardedRef}
			className={cn(
				"flex max-h-min min-h-0 flex-1 flex-col overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_[cmdk-list-sizer]]:[-ms-overflow-style:none] [&_[cmdk-list-sizer]]:[scrollbar-width:none] [&_[cmdk-list-sizer]]:[&::-webkit-scrollbar]:hidden",
				className,
			)}
			{...rest}
		/>
	);
});
CommandList.displayName = "CommandList";

const CommandGroup = React.forwardRef<
	React.ComponentRef<typeof Command.Group>,
	React.ComponentPropsWithoutRef<typeof Command.Group>
>(({ className, ...rest }, forwardedRef) => {
	return (
		<Command.Group
			ref={forwardedRef}
			className={cn(
				"relative px-1.5 py-1",
				// heading typography matching compact design
				"[&>[cmdk-group-heading]]:font-medium [&>[cmdk-group-heading]]:text-[11px] [&>[cmdk-group-heading]]:text-text-soft-400",
				"[&>[cmdk-group-heading]]:mb-1 [&>[cmdk-group-heading]]:px-2.5 [&>[cmdk-group-heading]]:pt-1",
				className,
			)}
			{...rest}
		/>
	);
});
CommandGroup.displayName = "CommandGroup";

const commandItemVariants = tv({
	base: [
		"flex items-center gap-2.5 rounded-lg bg-transparent",
		"cursor-pointer text-paragraph-sm font-normal text-text-strong-950",
		"transition-all duration-150 ease-out",
		// hover/selected pill background
		"data-[selected=true]:bg-bg-weak-50 dark:data-[selected=true]:bg-white/[0.08]",
	],
	variants: {
		size: {
			small: "px-2.5 py-1.5",
			medium: "px-2.5 py-2",
		},
	},
	defaultVariants: {
		size: "small",
	},
});

type CommandItemProps = VariantProps<typeof commandItemVariants> &
	React.ComponentPropsWithoutRef<typeof Command.Item>;

const CommandItem = React.forwardRef<
	React.ComponentRef<typeof Command.Item>,
	CommandItemProps
>(({ className, size, ...rest }, forwardedRef) => {
	return (
		<Command.Item
			ref={forwardedRef}
			className={commandItemVariants({ size, class: className })}
			{...rest}
		/>
	);
});
CommandItem.displayName = "CommandItem";

function CommandItemIcon<T extends React.ElementType>({
	className,
	as,
	...rest
}: PolymorphicComponentProps<T>) {
	const Component = as || "div";

	return (
		<Component
			className={cn("size-4 shrink-0 text-text-sub-600", className)}
			{...rest}
		/>
	);
}

function CommandFooter({
	className,
	...rest
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex h-10 items-center justify-between gap-3 border-stroke-soft-200 border-t px-3.5 dark:border-white/10",
				className,
			)}
			{...rest}
		/>
	);
}

function CommandFooterKeyBox({
	className,
	...rest
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex h-5 w-auto min-w-[20px] shrink-0 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-1 font-sans text-[10px] text-text-sub-600 shadow-2xs dark:border-white/10 dark:bg-white/[0.08] dark:text-text-soft-400",
				className,
			)}
			{...rest}
		/>
	);
}

function CommandEmpty({
	className,
	...rest
}: React.ComponentPropsWithoutRef<typeof Command.Empty>) {
	return (
		<Command.Empty
			className={cn(
				"flex flex-col items-center justify-center py-12 text-center",
				className,
			)}
			{...rest}
		/>
	);
}

function CommandSeparator({
	className,
	...rest
}: React.ComponentPropsWithoutRef<typeof Command.Separator>) {
	return (
		<Command.Separator
			className={cn("h-px bg-stroke-soft-200", className)}
			{...rest}
		/>
	);
}

export {
	CommandDialog as Dialog,
	CommandDialogTitle as DialogTitle,
	CommandDialogDescription as DialogDescription,
	CommandInput as Input,
	CommandList as List,
	CommandGroup as Group,
	CommandItem as Item,
	CommandItemIcon as ItemIcon,
	CommandFooter as Footer,
	CommandFooterKeyBox as FooterKeyBox,
	CommandEmpty as Empty,
	CommandSeparator as Separator,
};
