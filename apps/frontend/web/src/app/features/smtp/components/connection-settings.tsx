"use client";

import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useState } from "react";

const SMTP_HOST = "smtp.reloop.sh";
const SMTP_PORTS = "587 / 2587 / 2465";
const SMTP_USER = "reloop";

type SettingCellProps = {
	label: string;
	value: string;
	copyable?: boolean;
	href?: string;
	hrefLabel?: string;
};

function SettingCell({
	label,
	value,
	copyable,
	href,
	hrefLabel,
}: SettingCellProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(value.replace(/\s+\/\s+/g, "/"));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const inner = (
		<>
			<p className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
				{label}
			</p>
			<div className="mt-6">
				<p className="font-serif text-[1.75rem] text-text-strong-950 leading-none tracking-tighter sm:text-[2rem] dark:text-white">
					{value}
				</p>
				{href && hrefLabel && (
					<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/55">
						{hrefLabel}
					</p>
				)}
			</div>
			{copyable && (
				<div className="mt-10 flex items-center gap-2 text-[14px] text-text-sub-600 dark:text-white/55">
					<Icon name="copy" className="size-4" />
					<span>{copied ? "Copied" : "Click to copy"}</span>
				</div>
			)}
			{href && (
				<div className="mt-10">
					<Link
						href={href}
						className="group inline-flex h-11 items-center justify-center overflow-hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 px-5 font-medium text-[14px] text-text-strong-950 transition-colors duration-300 hover:bg-bg-weak-50 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
					>
						<span className="inline-flex items-center">
							<span className="group-hover:-translate-x-1 transition-transform duration-300 ease-out">
								Get your API key
							</span>
							<Icon
								name="arrow-left"
								className="ml-0 size-4 max-w-0 shrink-0 translate-x-1 rotate-180 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
								aria-hidden
							/>
						</span>
					</Link>
				</div>
			)}
		</>
	);

	if (copyable) {
		return (
			<button
				type="button"
				onClick={handleCopy}
				className="flex min-h-[220px] w-full flex-col border-stroke-soft-200 border-r border-b p-8 text-left transition-colors hover:bg-bg-weak-50/60 sm:min-h-[240px] lg:p-10 dark:border-white/10 dark:hover:bg-white/[0.02]"
			>
				{inner}
			</button>
		);
	}

	if (href) {
		return (
			<div className="flex min-h-[220px] flex-col border-stroke-soft-200 border-r border-b p-8 sm:min-h-[240px] lg:p-10 dark:border-white/10">
				{inner}
			</div>
		);
	}

	return (
		<div className="flex min-h-[220px] flex-col border-stroke-soft-200 border-r border-b p-8 sm:min-h-[240px] lg:p-10 dark:border-white/10">
			{inner}
		</div>
	);
}

export default function ConnectionSettings() {
	return (
		<div
			id="setup"
			className="scroll-mt-24 overflow-hidden rounded-4xl border-stroke-soft-200 border-t border-l sm:grid sm:grid-cols-2 dark:border-white/10"
		>
			<SettingCell label="Host" value={SMTP_HOST} copyable />
			<SettingCell label="Port" value={SMTP_PORTS} copyable />
			<SettingCell label="Username" value={SMTP_USER} copyable />
			<SettingCell
				label="Password"
				value="Your API key"
				href="/dashboard/signup"
				hrefLabel="Use your Reloop API key as the SMTP password."
			/>
		</div>
	);
}
