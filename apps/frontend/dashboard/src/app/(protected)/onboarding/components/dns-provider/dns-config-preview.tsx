"use client";

import type { DomainNameserversResponse } from "@reloop/api";
import useSWR from "swr";

import { DnsDeliverabilityTips } from "./dns-deliverability-tips";
import { DnsProviderDetected } from "./dns-provider-detected";
import { DnsProviderNotDetected } from "./dns-provider-not-detected";
import { PROVIDERS, type ProviderKey } from "./dns-providers";

interface DnsConfigPreviewProps {
	domainId?: string;
	domainName?: string;
}

export const DnsConfigPreview = ({
	domainId,
	domainName,
}: DnsConfigPreviewProps) => {
	const { data: nameserverData, isLoading } = useSWR<DomainNameserversResponse>(
		domainId ? `/api/domain/v1/nameservers/${domainId}` : null,
	);

	const detectedProvider =
		(nameserverData?.dnsProvider as ProviderKey) || "unknown";

	const handleAutoConnect = async () => {};

	const provider = PROVIDERS[detectedProvider];

	return (
		<div className="flex h-full w-full flex-col items-center justify-center p-6">
			<div className="flex w-full max-w-[440px] flex-col gap-4">
				{/* Provider Status Card */}
				<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/40">
					{/* Content Section */}
					{detectedProvider === "unknown" && !isLoading ? (
						<DnsProviderNotDetected domain={domainName} />
					) : (
						<DnsProviderDetected
							provider={provider}
							domain={domainName}
							isLoading={isLoading}
							onAutoConnect={handleAutoConnect}
						/>
					)}
				</div>

				{/* Deliverability Tips Card */}
				<DnsDeliverabilityTips />
			</div>
		</div>
	);
};
