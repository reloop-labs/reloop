"use client";

import type {
	DomainNameserversResponse,
	DomainResponse,
} from "@fe/dashboard/types/api.types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useParams } from "next/navigation";
import * as React from "react";
import * as simpleIcons from "simple-icons";
import useSWR from "swr";
import { inferDnsProvider } from "@fe/dashboard/app/(protected)/(layout)/domain/[domainId]/utils";
import { useDomainConnect } from "@fe/dashboard/features/domain/detail/hooks/use-domain-connect";
import Spinner from "@reloop/ui/spinner";

interface DNSAutoConnectBannerProps {
	domain?: DomainResponse;
	domainId?: string;
}

const DNSAutoConnectBannerSkeleton = () => (
	<div className="mb-8 overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40">
		<div className="flex items-center justify-between gap-6">
			<div className="flex items-center gap-4">
				<Skeleton className="h-12 w-12 rounded-xl" />
				<div className="space-y-2">
					<Skeleton className="h-5 w-48" />
					<Skeleton className="h-4 w-72" />
				</div>
			</div>
			<Skeleton className="h-10 w-40 rounded-lg" />
		</div>
	</div>
);

export const DNSAutoConnectBanner: React.FC<DNSAutoConnectBannerProps> = ({
	domain,
	domainId: domainIdProp,
}) => {
	const params = useParams();
	const domainId = domainIdProp || params?.domainId;
	const { startAutoConnect, isConnecting } = useDomainConnect(
		typeof domainId === "string" ? domainId : undefined,
	);
	const { data: nameserverData, isLoading } = useSWR<DomainNameserversResponse>(
		domainId ? `/api/domain/v1/nameservers/${domainId}` : null,
	);

	const nameservers = nameserverData?.nameservers;

	const provider = React.useMemo(
		() => inferDnsProvider(nameservers),
		[nameservers],
	);

	const status = domain?.status || "pending";

	// Show only if domain status is "pending" or "failed" and DNS is not yet configured
	if (status !== "pending" && status !== "failed") {
		return null;
	}

	if (isLoading) {
		return <DNSAutoConnectBannerSkeleton />;
	}

	const handleAutoConnect = () => {
		startAutoConnect();
	};

	// State: DNS Provider Found (Supported for Auto-connect)
	if (provider?.url) {
		const dnsIcon = provider.iconKey
			? ((simpleIcons as Record<string, { svg: string; hex: string }>)[
					provider.iconKey
				] ?? null)
			: null;

		return (
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40">
				<div className="flex items-center justify-between gap-6">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-white-0 shadow-sm ring-1 ring-stroke-soft-100 dark:bg-bg-weak-50/50 dark:ring-stroke-soft-100/40">
							{dnsIcon ? (
								<div
									className="flex h-10 w-10 items-center justify-center rounded-lg"
									style={{ backgroundColor: `#${dnsIcon.hex}15` }}
								>
									<span
										className="flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
										style={{ fill: `#${dnsIcon.hex}` }}
										// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted SVG from simple-icons
										dangerouslySetInnerHTML={{ __html: dnsIcon.svg }}
									/>
								</div>
							) : (
								<Icon name="globe" className="h-6 w-6 text-text-sub-600" />
							)}
						</div>
						<div className="space-y-1">
							<h3 className="font-semibold text-paragraph-base text-text-strong-950">
								{provider.label}
							</h3>
							<p className="text-paragraph-xs text-text-sub-600 leading-relaxed">
								We've detected your domain is managed by {provider.label}. We
								can automatically configure all required DNS records for you.
							</p>
						</div>
					</div>

					<Button.Root
						type="button"
						variant="neutral"
						mode="filled"
						onClick={handleAutoConnect}
						className="h-10 shrink-0 gap-2 px-4"
						disabled={isConnecting}
					>
						{isConnecting ? (
							<>
								<Spinner color="currentColor" />
								<span className="font-semibold text-sm">Connecting...</span>
							</>
						) : (
							<>
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
											<title>Sparkles Icon</title>
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
								<span className="font-semibold text-sm">Auto-populate records</span>
							</>
						)}
					</Button.Root>
				</div>
			</div>
		);
	}

	// State: DNS Provider NOT Found (Manual Setup Required)
	return (
		<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40">
			<div className="flex flex-col gap-6">
				<div className="flex items-center gap-4">
					<div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-white-0 ring-1 ring-stroke-soft-100 dark:bg-bg-weak-50/50 dark:ring-stroke-soft-100/40">
						<Icon name="server" className="h-6 w-6 text-text-soft-400" />
						<div className="absolute top-2 right-2 size-2 rounded-full border border-bg-white-0 bg-error-base dark:border-stroke-soft-100/40" />
					</div>
					<div className="space-y-1">
						<h3 className="font-semibold text-paragraph-base text-text-strong-950">
							We couldn't detect a supported DNS provider
						</h3>
						<p className="text-paragraph-xs text-text-sub-600 leading-relaxed">
							Go to your{" "}
							<span className="font-medium text-text-strong-950">
								Domain Registrar &rarr; DNS Settings &rarr; Add Records
							</span>{" "}
							using the values below.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
