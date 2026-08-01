"use client";

/**
 * Floating selection ActionBar — visual match for Dice UI / tablecn.
 * https://diceui.com/docs/components/base/action-bar
 */

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";
import { createPortal } from "react-dom";

type ActionBarContextValue = {
	onOpenChange?: (open: boolean) => void;
};

const ActionBarContext = createContext<ActionBarContextValue | null>(null);

function useActionBarContext(consumer: string) {
	const context = useContext(ActionBarContext);
	if (!context) {
		throw new Error(`\`${consumer}\` must be used within \`ActionBar\``);
	}
	return context;
}

export function ActionBar({
	open,
	onOpenChange,
	children,
	className,
	sideOffset = 16,
}: {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
	className?: string;
	sideOffset?: number;
}) {
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onOpenChange?.(false);
		};
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, onOpenChange]);

	const contextValue = useMemo(
		() => ({ onOpenChange }),
		[onOpenChange],
	);

	if (typeof document === "undefined") return null;

	return (
		<ActionBarContext.Provider value={contextValue}>
			{createPortal(
				<AnimatePresence>
					{open ? (
						<motion.div
							role="toolbar"
							aria-orientation="horizontal"
							data-slot="action-bar"
							data-side="bottom"
							data-align="center"
							initial={{ opacity: 0, y: 16, scale: 0.95, x: "-50%" }}
							animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
							exit={{ opacity: 0, y: 16, scale: 0.95, x: "-50%" }}
							transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
							className={cn(
								"fixed left-1/2 z-50 flex flex-row items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5 shadow-regular-md outline-none",
								"dark:border-stroke-soft-100/50 dark:bg-bg-weak-50",
								className,
							)}
							style={{ bottom: sideOffset }}
						>
							{children}
						</motion.div>
					) : null}
				</AnimatePresence>,
				document.body,
			)}
		</ActionBarContext.Provider>
	);
}

export function ActionBarSelection({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			data-slot="action-bar-selection"
			className={cn(
				"flex items-center gap-1 rounded-sm border border-stroke-soft-200 px-2 py-1 font-medium text-sm text-text-strong-950 tabular-nums dark:border-stroke-soft-100/50",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function ActionBarGroup({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			data-slot="action-bar-group"
			className={cn("flex items-center gap-2 outline-none", className)}
		>
			{children}
		</div>
	);
}

export function ActionBarClose({
	children,
	onClick,
	className,
}: {
	children?: React.ReactNode;
	onClick?: () => void;
	className?: string;
}) {
	const { onOpenChange } = useActionBarContext("ActionBarClose");

	const handleClick = useCallback(() => {
		onClick?.();
		onOpenChange?.(false);
	}, [onClick, onOpenChange]);

	return (
		<button
			type="button"
			aria-label="Clear selection"
			data-slot="action-bar-close"
			onClick={handleClick}
			className={cn(
				"rounded-sm opacity-70 outline-none transition hover:opacity-100 focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
		>
			{children}
		</button>
	);
}

export function ActionBarSeparator({ className }: { className?: string }) {
	return (
		<div
			aria-hidden
			data-slot="action-bar-separator"
			className={cn(
				"h-6 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/50",
				"in-data-[slot=action-bar-selection]:ml-0.5 in-data-[slot=action-bar-selection]:h-4",
				className,
			)}
		/>
	);
}

export function ActionBarItem({
	children,
	onClick,
	disabled,
	variant = "default",
	className,
}: {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "default" | "destructive";
	className?: string;
}) {
	return (
		<Button.Root
			type="button"
			data-slot="action-bar-item"
			variant={variant === "destructive" ? "error" : "neutral"}
			mode="lighter"
			size="xxsmall"
			disabled={disabled}
			onClick={onClick}
			className={cn("gap-1 px-2.5 text-[0.8rem]", className)}
		>
			{children}
		</Button.Root>
	);
}
