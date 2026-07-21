"use client";

import { cn } from "@reloop/ui/cn";
import * as Button from "@reloop/ui/button";
import { useState } from "react";

/**
 * In-place confirm / form strip — replaces modals for console actions.
 * Render next to the control that triggered the action.
 */
export function InlineActionPanel({
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	destructive = false,
	onConfirm,
	onCancel,
	children,
	className,
}: {
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
	onConfirm: () => Promise<void> | void;
	onCancel: () => void;
	children?: React.ReactNode;
	className?: string;
}) {
	const [loading, setLoading] = useState(false);

	return (
		<div
			className={cn(
				"rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/80 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.04]",
				destructive && "border-red-500/20 bg-red-500/[0.04]",
				className,
			)}
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0 max-w-xl">
					<p className="font-semibold text-[13px] text-text-strong-950">
						{title}
					</p>
					{description ? (
						<p className="mt-1 text-[12px] text-text-sub-600 leading-relaxed">
							{description}
						</p>
					) : null}
				</div>
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						disabled={loading}
						onClick={onCancel}
					>
						{cancelLabel}
					</Button.Root>
					<Button.Root
						variant={destructive ? "error" : "primary"}
						size="small"
						disabled={loading}
						onClick={async () => {
							try {
								setLoading(true);
								await onConfirm();
							} finally {
								setLoading(false);
							}
						}}
					>
						{loading ? "Working…" : confirmLabel}
					</Button.Root>
				</div>
			</div>
			{children ? <div className="mt-3 space-y-2">{children}</div> : null}
		</div>
	);
}
