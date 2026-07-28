import type { ReactNode } from "react";
import { cn } from "@reloop/ui/cn";

/**
 * Two-layer card matching Create Contact:
 * soft outer frame + inset rounded white panel.
 *
 * Layout:
 *   ┌ outer (soft) ──────────────────┐
 *   │  header (on outer)             │
 *   │  ┌ inner white (m-0.5) ──────┐ │
 *   │  │  body                     │ │
 *   │  └───────────────────────────┘ │
 *   └────────────────────────────────┘
 */
export function HomeCardShell({
	header,
	children,
	className,
	innerClassName,
}: {
	/** Sits on the outer soft frame, above the inset white panel. */
	header?: ReactNode;
	/** Content of the inset white panel. */
	children: ReactNode;
	className?: string;
	innerClassName?: string;
}) {
	return (
		<div
			className={cn(
				"flex h-full flex-col overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]",
				className,
			)}
		>
			{header ? (
				<div className="shrink-0 px-5 pt-3 pb-2.5">{header}</div>
			) : null}

			{/* Inset white panel — soft outer shows as a frame around this */}
			<div
				className={cn(
					"m-0.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]",
					header ? "mt-0" : null,
					innerClassName,
				)}
			>
				{children}
			</div>
		</div>
	);
}

/** Title row for HomeCardShell `header` — no border (sits on soft outer). */
export function HomeCardHeader({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-between gap-3",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function HomeCardBody({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"min-h-0 flex-1 bg-bg-white-0 dark:bg-transparent",
				className,
			)}
		>
			{children}
		</div>
	);
}
