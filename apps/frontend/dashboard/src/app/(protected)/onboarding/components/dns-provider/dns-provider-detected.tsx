"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import type { PROVIDERS } from "./dns-providers";

interface DnsProviderDetectedProps {
	provider: (typeof PROVIDERS)[keyof typeof PROVIDERS];
	domain?: string;
	isLoading: boolean;
	onAutoConnect: () => Promise<void>;
}

export const DnsProviderDetected = ({
	provider,
	domain,
	isLoading,
	onAutoConnect,
}: DnsProviderDetectedProps) => {
	return (
		<div>
			{/* Header */}
			<div className="mb-6 flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40">
					{isLoading ? (
						<div className="animate-pulse">
							<Icon name="globe" className="h-5 w-5 text-text-soft-400" />
						</div>
					) : (
						provider.icon
					)}
				</div>
				<div>
					<span className="font-semibold text-[10px] text-text-soft-400 uppercase leading-none tracking-wider">
						DNS Provider Detected
					</span>
					<h3 className="font-bold text-lg text-text-strong-950 leading-tight">
						{isLoading ? "Scanning..." : provider.name}
					</h3>
				</div>
			</div>

			{/* Divider */}
			<div className="mb-6 h-px w-full bg-stroke-soft-200 dark:bg-stroke-soft-100/40" />

			<div className="space-y-6">
				<div className="flex items-center gap-2">
					<Icon name="globe" className="h-4 w-4 text-text-soft-400" />
					<div className="rounded-lg bg-bg-strong-950 px-3 py-1.5 font-mono text-sm text-text-white-0">
						{domain || "myapp.com"}
					</div>
				</div>

				<p className="text-paragraph-sm text-text-sub-600 leading-relaxed">
					Your domain is managed by{" "}
					<span className="font-bold text-text-strong-950">
						{isLoading ? "Scanning..." : provider.name}
					</span>
					. We can automatically add all the required DNS records for you
					&mdash; no need to copy and paste anything manually.
				</p>

				<Button.Root
					type="button"
					variant="neutral"
					mode="filled"
					disabled={isLoading}
					onClick={onAutoConnect}
					className="w-full justify-between px-4"
				>
					<div className="flex items-center gap-2">
						<Button.Icon
							as={Icon}
							name="refresh-cw"
							className={isLoading ? "animate-spin" : ""}
						/>
						<span>Auto-populate DNS records</span>
					</div>
					<span className="rounded-full bg-bg-white-0/10 px-2 py-0.5 text-[10px] text-text-white-0">
						1-click
					</span>
				</Button.Root>
			</div>
		</div>
	);
};
