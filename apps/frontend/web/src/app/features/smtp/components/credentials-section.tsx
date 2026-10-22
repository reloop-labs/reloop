"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { hostedSignupHref } from "@reloop/web/lib/site";
import { useState } from "react";
import { SectionHeader } from "./section-header";
import { SMTP_HOST, SMTP_PORTS, SMTP_USER } from "./smtp-data";

const cellClassName =
	"flex min-w-0 flex-col gap-5 border-stroke-soft-100 border-b px-4 py-8 text-left sm:px-8 lg:border-r lg:border-b-0 lg:px-10 lg:py-10 lg:last:border-r-0 dark:border-white/10";

function CopyCell({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label={`Copy ${label.toLowerCase()} ${value}`}
			className={cn(
				cellClassName,
				"group transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.03]",
			)}
		>
			<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/60">
				{label}
			</span>
			<span className="truncate font-medium font-mono text-[1.35rem] text-text-strong-950 tracking-tight sm:text-[1.5rem] dark:text-white">
				{value}
			</span>
			<span className="mt-auto flex items-center justify-between gap-3 text-[13px] text-text-sub-600 dark:text-white/50">
				<span className="truncate">{hint}</span>
				<span className="inline-flex shrink-0 items-center gap-1.5 text-text-strong-950 opacity-60 transition-opacity group-hover:opacity-100 dark:text-white">
					<Icon
						name={copied ? "check-circle" : "copy"}
						className="size-3.5"
						aria-hidden
					/>
					{copied ? "Copied" : "Copy"}
				</span>
			</span>
		</button>
	);
}

export function CredentialsSection() {
	return (
		<section
			id="setup"
			aria-labelledby="setup-heading"
			className="w-full scroll-mt-24 bg-bg-white-0 dark:bg-black"
		>
			<SectionHeader
				id="setup-heading"
				icon="key"
				eyebrow="Connection settings"
				title={
					<>
						Four settings.
						<br />
						Zero code changes.
					</>
				}
				description="Paste these into any SMTP client. Your Reloop API key is the password, so there is no separate SMTP user to create or rotate."
			/>

			<div className="grid lg:grid-cols-3">
				<CopyCell
					label="Host"
					value={SMTP_HOST}
					hint="Same host for every app."
				/>
				<CopyCell
					label="Username"
					value={SMTP_USER}
					hint="Any value works; the key decides."
				/>
				<div className={cellClassName}>
					<span className="font-medium text-[13px] text-text-sub-600 dark:text-white/60">
						Password
					</span>
					<span className="truncate font-medium font-mono text-[1.35rem] text-text-strong-950 tracking-tight sm:text-[1.5rem] dark:text-white">
						rl_your_api_key
					</span>
					<a
						href={hostedSignupHref}
						className="group mt-auto inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 hover:text-text-sub-600 dark:text-white dark:hover:text-white/70"
					>
						Create an API key
						<Icon
							name="arrow-right"
							className="size-3 transition-transform group-hover:translate-x-0.5"
							aria-hidden
						/>
					</a>
				</div>
			</div>

			<div className="grid grid-cols-2 border-stroke-soft-100 border-t lg:grid-cols-4 dark:border-white/10">
				{SMTP_PORTS.map((p, index) => (
					<div
						key={p.port}
						className={cn(
							"flex min-w-0 flex-col gap-1.5 border-stroke-soft-100 px-4 py-6 sm:px-8 lg:px-10 dark:border-white/10",
							index % 2 === 0 && "border-r",
							index < 2 && "border-b lg:border-b-0",
							index === 1 && "lg:border-r",
						)}
					>
						<span className="flex items-baseline gap-2">
							<span className="font-mono font-semibold text-[1.25rem] text-text-strong-950 tracking-tight dark:text-white">
								{p.port}
							</span>
							<span className="font-medium text-[12px] text-text-sub-600 dark:text-white/50">
								{p.mode}
							</span>
						</span>
						<span className="text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
							{p.note}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
