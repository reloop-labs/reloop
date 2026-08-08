"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import type { CheckStatus } from "@reloop/web/lib/landing/tools/validation-utils";
import Link from "next/link";
import type { ReactNode } from "react";

export function ToolTopBar({
	breadcrumb,
	title,
	subtitle,
	accent = "emerald",
}: {
	breadcrumb: { label: string; href: string }[];
	title: string;
	subtitle: string;
	accent?: "emerald" | "orange" | "blue" | "violet" | "rose" | "indigo";
}) {
	const accentBg = {
		emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
		orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
		blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
		violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
		rose: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
		indigo: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
	}[accent];

	return (
		<div className="border-stroke-soft-200 border-b bg-white dark:border-white/10 dark:bg-[#0a0a0a]">
			<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
				<nav className="mb-4 flex flex-wrap items-center gap-2 text-[13px] text-text-sub-600 dark:text-white/55">
					{breadcrumb.map((item, i) => (
						<span key={item.href} className="flex items-center gap-2">
							{i > 0 && <span>/</span>}
							<Link href={item.href} className="hover:text-primary-base">
								{item.label}
							</Link>
						</span>
					))}
				</nav>
				<div
					className={`mb-3 inline-flex rounded-full px-3 py-1 font-semibold text-[11px] uppercase tracking-wider ${accentBg}`}
				>
					Free tool
				</div>
				<h1 className="font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
					{title}
				</h1>
				<p className="mt-2 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed dark:text-white/50">
					{subtitle}
				</p>
			</div>
		</div>
	);
}

function StatusIcon({ status }: { status: CheckStatus }) {
	if (status === "pass") {
		return <Icon name="check" className="size-5 text-emerald-500" />;
	}
	if (status === "fail") {
		return <Icon name="cross-circle" className="size-5 text-red-500" />;
	}
	if (status === "warn") {
		return <Icon name="alert-circle" className="size-5 text-amber-500" />;
	}
	return (
		<Icon
			name="alert-circle"
			className="size-5 text-text-sub-600 dark:text-white/55"
		/>
	);
}

export function ToolUpsell({
	title,
	description,
	primaryHref,
	primaryLabel,
	secondaryHref,
	secondaryLabel,
}: {
	title: string;
	description?: string;
	primaryHref: string;
	primaryLabel: string;
	secondaryHref?: string;
	secondaryLabel?: string;
}) {
	return (
		<div className="relative overflow-hidden border-stroke-soft-200 border-t bg-[#0d0d0f] dark:border-white/[0.06]">
			{/* Subtle grid overlay */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>
			{/* Radial glow */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 60% 80% at 50% 50%, rgba(109,40,217,0.18) 0%, transparent 70%)",
				}}
			/>
			<div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-20 text-center sm:px-10">
				<div className="flex flex-col items-center gap-4">
					<p className="font-semibold text-3xl text-white leading-tight tracking-tight sm:text-4xl">
						{title}
					</p>
					<p className="max-w-md text-[15px] text-white/50 leading-relaxed">
						{description}
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Link
						href={primaryHref}
						className={Button.buttonVariants({ variant: "neutral" }).root({
							className:
								"rounded-full bg-white! px-6 text-black! hover:bg-white/90!",
						})}
					>
						{primaryLabel}
					</Link>
					{secondaryHref && secondaryLabel && (
						<Link
							href={secondaryHref}
							className={Button.buttonVariants({
								mode: "stroke",
								variant: "neutral",
							}).root({
								className:
									"rounded-full border-white/20! px-6 text-white! hover:border-white/40! hover:bg-white/5!",
							})}
						>
							{secondaryLabel}
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}

export function ChecklistTable({
	checks,
}: {
	checks: {
		label: string;
		status: CheckStatus;
		detail: string;
		record?: string;
	}[];
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-stroke-soft-200 dark:border-white/10">
			<table className="w-full text-left text-[14px]">
				<thead>
					<tr className="border-stroke-soft-200 border-b bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03]">
						<th className="px-4 py-3 font-semibold text-text-strong-950 dark:text-white">
							Check
						</th>
						<th className="px-4 py-3 font-semibold text-text-strong-950 dark:text-white">
							Result
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/10">
					{checks.map((check) => (
						<tr key={check.label}>
							<td className="px-4 py-3 font-medium text-text-strong-950 dark:text-white">
								<div className="flex items-center gap-2">
									<StatusIcon status={check.status} />
									{check.label}
								</div>
							</td>
							<td className="px-4 py-3 text-text-sub-600 dark:text-white/50">
								{check.detail}
								{check.record && (
									<code className="mt-2 block overflow-x-auto rounded bg-bg-weak-50 p-2 font-mono text-[12px] dark:bg-black">
										{check.record}
									</code>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ToolPanel({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`rounded-2xl border border-stroke-soft-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8 dark:border-white/10 dark:bg-[#111] dark:shadow-none ${className}`}
		>
			{children}
		</div>
	);
}
