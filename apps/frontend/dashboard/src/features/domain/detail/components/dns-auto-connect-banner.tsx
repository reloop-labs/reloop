import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import * as simpleIcons from "simple-icons";
import type { DomainResponse } from "#/features/domain/types";
import {
	DNS_SETUP_HUB_URL,
	type InferredDnsProvider,
} from "../../dns-provider";
import { useDomainNameserversQuery } from "../../hooks/use-domains-query";
import { useDomainConnect } from "../hooks/use-domain-connect";
import { inferDnsProvider } from "../utils";

interface DNSAutoConnectBannerProps {
	domain?: DomainResponse;
	domainId?: string;
	/** When true, show even if domain status is not pending/failed (e.g. setup flow). */
	forceShow?: boolean;
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

function ProviderIcon({ provider }: { provider: InferredDnsProvider }) {
	const dnsIcon = provider.iconKey
		? ((simpleIcons as Record<string, { svg: string; hex: string }>)[
				provider.iconKey
			] ?? null)
		: null;

	return (
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
	);
}

export const DNSAutoConnectBanner: React.FC<DNSAutoConnectBannerProps> = ({
	domain,
	domainId: domainIdProp,
	forceShow = false,
}) => {
	const domainId = domainIdProp || domain?.id;
	const { startAutoConnect, isConnecting } = useDomainConnect(
		typeof domainId === "string" ? domainId : undefined,
	);
	const { data: nameserverData, isPending: isLoading } =
		useDomainNameserversQuery(typeof domainId === "string" ? domainId : null);

	const nameservers = nameserverData?.nameservers;

	const provider = React.useMemo(
		() => inferDnsProvider(nameservers),
		[nameservers],
	);

	const status = domain?.status || "pending";

	// Show only if domain status is "pending", "verifying", or "failed" and DNS is not yet configured
	if (
		!forceShow &&
		status !== "pending" &&
		status !== "failed" &&
		status !== "verifying"
	) {
		return null;
	}

	if (isLoading) {
		return <DNSAutoConnectBannerSkeleton />;
	}

	// Auto-populate: provider has onboarded Reloop's Domain Connect template
	if (provider?.supportsAutoConnect) {
		return (
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40">
				<div className="flex items-center justify-between gap-6">
					<div className="flex items-center gap-4">
						<ProviderIcon provider={provider} />
						<div className="space-y-1">
							<h3 className="font-semibold text-paragraph-base text-text-strong-950">
								{provider.label}
							</h3>
							<p className="text-paragraph-xs text-text-sub-600 leading-relaxed">
								We've detected your domain is managed by {provider.label}. We
								can automatically configure all required DNS records for you.
							</p>
							<a
								href={provider.docsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-paragraph-xs text-text-sub-600 underline decoration-stroke-soft-200 decoration-dashed underline-offset-4 transition-colors hover:text-text-strong-950"
							>
								{provider.docsSlug
									? `Manual ${provider.label} setup guide`
									: "Browse all DNS setup guides"}
								<Icon
									name="link-external"
									className="h-3 w-3 text-text-soft-400"
								/>
							</a>
						</div>
					</div>

					<FancyButton.Root
						type="button"
						variant="blue"
						size="small"
						onClick={() => void startAutoConnect()}
						className="min-w-[170px] justify-center overflow-hidden rounded-xl px-4 transition-all duration-200"
						disabled={isConnecting}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={isConnecting ? "connecting" : "idle"}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{
									opacity: 0,
									y: -14,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									y: 14,
								}}
								className="flex items-center justify-center gap-1.5"
							>
								{isConnecting ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Connecting...</span>
									</>
								) : (
									"Auto-populate records"
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</div>
		);
	}

	// Detected provider without Reloop template onboarding → manual
	if (provider) {
		const manualHref = provider.url || provider.docsUrl;
		return (
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-4 dark:border-stroke-soft-100/40">
				<div className="flex items-center justify-between gap-6">
					<div className="flex items-center gap-4">
						<ProviderIcon provider={provider} />
						<div className="space-y-1">
							<h3 className="font-semibold text-paragraph-base text-text-strong-950">
								{provider.label}
							</h3>
							<p className="text-paragraph-xs text-text-sub-600 leading-relaxed">
								We've detected your domain is managed by {provider.label}. Add
								the DNS records below in your provider panel.
							</p>
							<a
								href={provider.docsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 text-paragraph-xs text-text-sub-600 underline decoration-stroke-soft-200 decoration-dashed underline-offset-4 transition-colors hover:text-text-strong-950"
							>
								{provider.docsSlug
									? `${provider.label} setup guide`
									: "Browse all DNS setup guides"}
								<Icon
									name="link-external"
									className="h-3 w-3 text-text-soft-400"
								/>
							</a>
						</div>
					</div>

					<FancyButton.Root
						type="button"
						variant="basic"
						size="small"
						className="min-w-[170px] justify-center overflow-hidden rounded-xl px-4"
						onClick={() =>
							window.open(manualHref, "_blank", "noopener,noreferrer")
						}
					>
						{provider.url ? "Open DNS settings" : "View setup guide"}
					</FancyButton.Root>
				</div>
			</div>
		);
	}

	// Provider not detected
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
							using the values below. Or pick your host from the{" "}
							<a
								href={DNS_SETUP_HUB_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-text-strong-950 underline decoration-stroke-soft-200 decoration-dashed underline-offset-4 transition-colors hover:opacity-80"
							>
								DNS setup guides
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
