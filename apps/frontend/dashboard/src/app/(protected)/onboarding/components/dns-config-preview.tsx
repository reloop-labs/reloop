"use client";

import type { DomainNameserversResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import useSWR from "swr";

import { PROVIDERS, type ProviderKey } from "./dns-providers";

interface DnsConfigPreviewProps {
	domain?: string;
}

export const DnsConfigPreview = ({ domain }: DnsConfigPreviewProps) => {
	const isDomainId = domain?.startsWith("domain_");

	const { data: nameserverData, isLoading } = useSWR<DomainNameserversResponse>(
		isDomainId ? `/api/domain/v1/nameservers/${domain}` : null,
	);

	const detectedProvider =
		(nameserverData?.dnsProvider as ProviderKey) || "unknown";

	const handleAutoConnect = async () => {};

	const provider = PROVIDERS[detectedProvider];

	return (
		<div className="flex h-full w-full flex-col items-center justify-center p-6">
			<div className="flex w-full max-w-[440px] flex-col gap-4">
				{/* Provider Status Card */}
				<div className="rounded-[14px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
					<div className="p-5">
						<div className="mb-6 flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-weak-50 dark:border-stroke-soft-100/40">
									{isLoading ? (
										<div className="animate-pulse">
											<Icon
												name="globe"
												className="h-5 w-5 text-text-soft-400"
											/>
										</div>
									) : (
										provider.icon
									)}
								</div>
								<div>
									<h3 className="font-bold text-lg text-text-strong-950 leading-tight">
										{isLoading ? "Scanning..." : provider.name}
									</h3>
								</div>
							</div>
						</div>
					</div>

					<Button.Root
						type="button"
						variant="neutral"
						disabled={isLoading}
						onClick={handleAutoConnect}
					>
						<Button.Icon
							as={() => {
								return (
									<svg
										className="h-3.5 w-3.5"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
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
								);
							}}
						/>
						Auto-populate DNS
					</Button.Root>
				</div>

				{/* Deliverability Tips Card */}
				<div className="overflow-hidden rounded-[14px] border border-stroke-soft-100/40 bg-bg-weak-50/50">
					<div className="flex items-center gap-2 px-4 pt-4 font-medium">
						<Icon name="bulb" className="h-3.5 w-3.5 text-warning-base" />
						<h4 className="font-semibold text-[10px] text-text-sub-600 uppercase tracking-wider">
							Quick Tips
						</h4>
					</div>
					<div className="space-y-4 p-5">
						{[
							{
								title: "Conversion",
								desc: "Verified domains get 80% higher open rates.",
							},
							{
								title: "Authentication",
								desc: "Set SPF & DKIM to avoid spam filters.",
							},
							{
								title: "Reputation",
								desc: "Use subdomains for higher sender scores.",
							},
						].map((item, idx) => (
							<div key={idx} className="flex flex-col gap-0.5">
								<div className="flex items-center gap-2">
									<div className="h-1 w-1 rounded-full bg-text-strong-950" />
									<span className="font-bold text-[10px] text-text-strong-950 uppercase tracking-wider">
										{item.title}
									</span>
								</div>
								<p className="pl-3 text-paragraph-sm text-text-sub-600 leading-snug">
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
