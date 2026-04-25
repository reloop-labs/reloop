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
					className="w-full items-center gap-2"
				>
					<Button.Icon
						as={() => (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-3.5 w-3.5"
							>
								<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
								<path d="m14 7 3 3" />
								<path d="M5 6v4" />
								<path d="M19 14v4" />
								<path d="M10 2v2" />
								<path d="M7 8H3" />
								<path d="M21 16h-4" />
								<path d="M11 3H9" />
							</svg>
						)}
					/>
					<span>Auto-populate DNS records</span>
					<span className="rounded-full bg-bg-white-0/10 px-2 text-[10px] text-text-white-0">
						1-click
					</span>
				</Button.Root>
			</div>
		</div>
	);
};
