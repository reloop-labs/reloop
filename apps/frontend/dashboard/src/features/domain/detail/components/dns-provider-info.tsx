import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as React from "react";
import * as simpleIcons from "simple-icons";
import { useDomainNameserversQuery } from "../../hooks/use-domains-query";
import { isDomainRecordId } from "../../utils";
import { inferDnsProvider } from "../utils";

export function DNSProviderInfo({
	domainId,
	isLoading: isLoadingDomain,
}: {
	domainId?: string | null;
	isLoading: boolean;
}) {
	const id = isDomainRecordId(domainId) ? domainId : null;
	const { data: nameserverData, isPending: isLoadingNameservers } =
		useDomainNameserversQuery(id);
	const nameservers = nameserverData?.nameservers;
	const isLoading = isLoadingDomain || isLoadingNameservers;

	const provider = React.useMemo(
		() => inferDnsProvider(nameservers),
		[nameservers],
	);

	if (!provider?.url) return null;

	const dnsIcon = provider.iconKey
		? ((simpleIcons as Record<string, { svg: string; hex: string }>)[
				provider.iconKey
			] ?? null)
		: null;

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-1.5">
				<Icon name="server" className="h-3.5 w-3.5 text-text-sub-600" />
				<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
					Provider
				</span>
			</div>
			{isLoading ? (
				<Skeleton className="h-5 w-24 rounded-lg" />
			) : (
				<div className="mt-0.5 flex items-center gap-1.5">
					<a
						href={provider.url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex cursor-pointer items-center gap-1.5 text-sm text-text-strong-950 transition-opacity hover:opacity-80"
					>
						{dnsIcon && (
							<span
								className="flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
								style={{ fill: `#${dnsIcon.hex}` }}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted SVG from simple-icons
								dangerouslySetInnerHTML={{ __html: dnsIcon.svg }}
							/>
						)}
						<span className="font-medium text-paragraph-sm underline decoration-stroke-soft-200 decoration-dashed underline-offset-4">
							{provider.label}
						</span>
						<Icon name="link-external" className="h-3 w-3 text-text-soft-400" />
					</a>
				</div>
			)}
		</div>
	);
}
