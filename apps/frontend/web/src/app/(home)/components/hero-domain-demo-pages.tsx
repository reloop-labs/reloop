"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdKey } from "@reloop/ui/kbd-key";
import type { Ref } from "react";
import { siCloudflare } from "simple-icons";

const kbdOnBlue =
	"h-4 w-auto min-w-4 rounded-[5px] px-1 text-[10px] leading-none border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const DNS_ROWS = [
	{
		type: "TXT",
		name: "send",
		value: "v=spf1 include:mail.reloop.sh ~all",
	},
	{
		type: "CNAME",
		name: "reloop._domainkey.send",
		value: "dkim.reloop.sh",
	},
	{
		type: "TXT",
		name: "_dmarc.send",
		value: "v=DMARC1; p=none;",
	},
] as const;

function CloudflareMark({ className }: { className?: string }) {
	return (
		<span
			className={cn("flex items-center justify-center [&>svg]:h-full [&>svg]:w-full", className)}
			style={{ fill: `#${siCloudflare.hex}` }}
			// Trusted SVG from simple-icons
			dangerouslySetInnerHTML={{ __html: siCloudflare.svg }}
		/>
	);
}

export function HeroCloudflareBox({
	boxRef,
	pressed,
	connecting,
}: {
	boxRef: Ref<HTMLDivElement>;
	pressed: boolean;
	connecting: boolean;
}) {
	return (
		<div
			ref={boxRef}
			className={cn(
				"overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 transition-transform duration-100 ease-out dark:border-stroke-soft-100/40",
				pressed && "scale-[0.99]",
			)}
		>
			<div className="flex items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-bg-white-0 ring-1 ring-stroke-soft-100 dark:bg-bg-weak-50/50 dark:ring-stroke-soft-100/40">
						<div
							className="flex size-9 items-center justify-center rounded-lg"
							style={{ backgroundColor: `#${siCloudflare.hex}18` }}
						>
							<CloudflareMark className="size-5" />
						</div>
					</div>
					<div className="min-w-0">
						<h3 className="font-semibold text-[14px] text-text-strong-950">
							Cloudflare
						</h3>
						<p className="mt-0.5 text-[12px] text-text-sub-600 leading-snug">
							We've detected your domain is managed by Cloudflare. We can
							automatically configure all required DNS records for you.
						</p>
					</div>
				</div>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					tabIndex={-1}
					className="min-w-[148px] shrink-0 justify-center overflow-hidden rounded-xl"
				>
					{connecting ? (
						<span>Connecting...</span>
					) : (
						<>
							<span>Auto populate</span>
							<KbdKey className={kbdOnBlue}>A</KbdKey>
						</>
					)}
				</FancyButton.Root>
			</div>
		</div>
	);
}

function DnsMiniTable() {
	return (
		<div className="w-full text-paragraph-sm">
			<div className="grid grid-cols-[64px_minmax(0,1fr)_minmax(0,1.4fr)] items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40">
				<div>Type</div>
				<div>Name</div>
				<div>Value</div>
			</div>
			<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
				{DNS_ROWS.map((row) => (
					<div
						key={row.name}
						className="grid grid-cols-[64px_minmax(0,1fr)_minmax(0,1.4fr)] items-center px-4 py-2.5"
					>
						<span className="font-medium text-[12px] text-text-sub-600">
							{row.type}
						</span>
						<span className="truncate font-medium text-[12px] text-text-strong-950">
							{row.name}
						</span>
						<span className="truncate font-mono text-[11px] text-text-sub-600">
							{row.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function HeroDomainSetupPage({
	domain,
	cloudflareRef,
	cloudflarePressed,
	connecting,
}: {
	domain: string;
	cloudflareRef: Ref<HTMLDivElement>;
	cloudflarePressed: boolean;
	connecting: boolean;
}) {
	return (
		<div className="h-full overflow-auto bg-bg-white-0 px-6 pt-8 sm:px-8 dark:bg-black">
			<div className="mx-auto max-w-3xl space-y-5">
				<div>
					<h2 className="font-semibold text-[22px] text-text-strong-950 tracking-tight">
						Configure DNS for {domain}
					</h2>
					<p className="mt-1 text-[13px] text-text-sub-600">
						Add these records at your DNS provider, then verify.
					</p>
				</div>

				<HeroCloudflareBox
					boxRef={cloudflareRef}
					pressed={cloudflarePressed}
					connecting={connecting}
				/>

				<DnsMiniTable />

				<div className="flex items-center justify-between gap-3 pt-2 pb-8">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						tabIndex={-1}
						className="rounded-xl"
					>
						Close
					</Button.Root>
					<FancyButton.Root
						type="button"
						variant="blue"
						size="small"
						tabIndex={-1}
						className="rounded-xl"
					>
						Verify & finish
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
}

export function HeroDomainDetailPage({ domain }: { domain: string }) {
	return (
		<div className="h-full overflow-auto bg-bg-white-0 px-6 pt-8 sm:px-8 dark:bg-black">
			<div className="mx-auto max-w-3xl space-y-6 pb-10">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border border-warning-base/25 bg-warning-base/10">
							<Icon name="globe" className="size-5 text-warning-base" />
						</div>
						<div className="min-w-0">
							<p className="font-medium text-[12px] text-text-sub-600">
								Domain
							</p>
							<h2 className="truncate font-semibold text-[20px] text-text-strong-950 leading-tight tracking-tight">
								{domain}
							</h2>
						</div>
					</div>
					<FancyButton.Root
						type="button"
						variant="blue"
						size="xsmall"
						tabIndex={-1}
						className="shrink-0 font-medium"
					>
						Verify Domain
					</FancyButton.Root>
				</div>

				<div className="grid grid-cols-3 gap-6">
					<div>
						<div className="flex items-center gap-1.5">
							<Icon name="calendar" className="size-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Created
							</span>
						</div>
						<p className="mt-1.5 font-medium text-[13px] text-text-strong-950">
							Just now
						</p>
					</div>
					<div>
						<div className="flex items-center gap-1.5">
							<Icon name="activity" className="size-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Status
							</span>
						</div>
						<div className="mt-1.5 flex items-center gap-1 text-warning-base">
							<Icon name="time" className="size-3.5" />
							<p className="font-medium text-[13px]">Verifying</p>
						</div>
					</div>
					<div>
						<div className="flex items-center gap-1.5">
							<Icon name="globe" className="size-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Provider
							</span>
						</div>
						<div className="mt-1.5 flex items-center gap-1.5">
							<CloudflareMark className="size-3.5" />
							<p className="font-medium text-[13px] text-text-strong-950">
								Cloudflare
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-warning-base/30 bg-warning-base/5 px-4 py-3">
					<p className="font-medium text-[13px] text-text-strong-950">
						We are verifying the DNS records...
					</p>
					<p className="mt-0.5 text-[12px] text-text-sub-600">
						It may take a few minutes, depending on Cloudflare propagation.
					</p>
				</div>

				<div>
					<div className="flex h-10 items-center gap-4 border-stroke-soft-200 border-b dark:border-white/10">
						<span className="flex items-center gap-2 border-text-strong-950 border-b-2 pb-2 font-medium text-[13px] text-text-strong-950">
							<Icon name="file-text" className="size-4" />
							DNS Records
						</span>
						<span className="flex items-center gap-2 pb-2 font-medium text-[13px] text-text-sub-600">
							<Icon name="gear" className="size-4" />
							Configuration
						</span>
					</div>
					<div className="mt-4">
						<DnsMiniTable />
					</div>
				</div>
			</div>
		</div>
	);
}
