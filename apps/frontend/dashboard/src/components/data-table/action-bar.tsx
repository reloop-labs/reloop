"use client";

/**
 * Floating selection ActionBar — visual match for modern pill action docks.
 */

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
	sideOffset = 20,
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

	const contextValue = useMemo(() => ({ onOpenChange }), [onOpenChange]);

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
							initial={{ opacity: 0, y: 24, scale: 0.92, x: "-50%" }}
							animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
							exit={{ opacity: 0, y: 16, scale: 0.94, x: "-50%" }}
							transition={{ type: "spring", stiffness: 420, damping: 28 }}
							className={cn(
								"fixed left-1/2 z-50 flex flex-row items-center gap-2 rounded-full border border-stroke-soft-200/80 bg-bg-white-0/95 p-1.5 outline-none",
								"dark:border-stroke-soft-100/30 dark:bg-bg-weak-50/95",
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
				"flex items-center gap-1.5 rounded-full border border-stroke-soft-200/70 bg-bg-weak-50 px-3 py-1 font-medium text-text-strong-950 text-xs tabular-nums shadow-2xs dark:border-stroke-soft-100/40 dark:bg-bg-sub-300/40",
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
			className={cn("flex items-center gap-1.5 outline-none", className)}
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
				"inline-flex size-4 items-center justify-center rounded-full text-text-sub-600 outline-none transition-all duration-150 hover:bg-bg-strong-950/10 hover:text-text-strong-950 focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20 active:scale-90 disabled:pointer-events-none dark:hover:bg-bg-white-0/20 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
				"h-4 w-px self-center bg-stroke-soft-200 dark:bg-stroke-soft-100/50",
				"in-data-[slot=action-bar-selection]:mx-0.5 in-data-[slot=action-bar-selection]:h-3.5",
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
	const isDestructive = variant === "destructive";

	return (
		<button
			type="button"
			data-slot="action-bar-item"
			disabled={disabled}
			onClick={onClick}
			className={cn(
				"inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 font-medium text-xs outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
				isDestructive
					? "border border-error-base/20 bg-error-alpha-10 text-error-base hover:border-transparent hover:bg-error-base hover:text-static-white dark:bg-error-alpha-10 dark:text-error-base dark:hover:bg-error-base dark:hover:text-static-white"
					: "border border-stroke-soft-200/60 bg-bg-weak-50 text-text-sub-600 hover:bg-bg-weak-50/80 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-bg-sub-300/30 dark:text-text-sub-600 dark:hover:bg-bg-sub-300/60 dark:hover:text-text-strong-950",
				className,
			)}
		>
			{children}
		</button>
	);
}
