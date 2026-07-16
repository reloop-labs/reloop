import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as React from "react";
import * as simpleIcons from "simple-icons";
import type { DomainResponse } from "./domain-types";
import { inferDnsProvider } from "./infer-dns-provider";
import { useDomainNameserversQuery } from "./use-domain-query";

function BannerSkeleton() {
	return (
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
}

export function DnsAutoConnectBanner({
	domain,
	domainId,
}: {
	domain?: DomainResponse;
	domainId: string;
}) {
	const { data: nameserverData, isLoading } =
		useDomainNameserversQuery(domainId);

	const provider = React.useMemo(
		() => inferDnsProvider(nameserverData?.nameservers),
		[nameserverData?.nameservers],
	);

	const status = domain?.status || "pending";

	if (status !== "pending" && status !== "failed") {
		return null;
	}

	if (isLoading) {
		return <BannerSkeleton />;
	}

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
										// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted simple-icons SVG
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
								We&apos;ve detected your domain is managed by {provider.label}.
								We can automatically configure all required DNS records for you.
							</p>
						</div>
					</div>

					<Button.Root
						type="button"
						variant="neutral"
						mode="filled"
						onClick={() => {
							// Backend auto-populate not wired yet — open provider DNS UI.
							if (provider.url) window.open(provider.url, "_blank");
						}}
						className="h-10 shrink-0 gap-2 px-4"
					>
						<span className="font-semibold text-sm">Open DNS settings</span>
					</Button.Root>
				</div>
			</div>
		);
	}

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
							We couldn&apos;t detect a supported DNS provider
						</h3>
						<p className="text-paragraph-xs text-text-sub-600 leading-relaxed">
							Go to your{" "}
							<span className="font-medium text-text-strong-950">
								Domain Registrar → DNS Settings → Add Records
							</span>{" "}
							using the values below.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
