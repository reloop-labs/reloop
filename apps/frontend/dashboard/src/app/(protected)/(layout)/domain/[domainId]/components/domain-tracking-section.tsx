"use client";

import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Select from "@reloop/ui/select";
import * as Switch from "@reloop/ui/switch";
import { useParams } from "next/navigation";
import { useClipboard } from "../hooks/use-clipboard";
import { useDomainActions } from "../hooks/use-domain-actions";

interface DomainTrackingSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
}

export const DomainTrackingSection = ({
	domain,
	isLoading,
}: DomainTrackingSectionProps) => {
	const { domainId } = useParams();
	const { handleUpdateDomain } = useDomainActions(domainId as string, domain);
	const { copiedItems, copyToClipboard } = useClipboard();

	const onToggleClickTracking = (value: boolean) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ isClickTrackingEnabled: value },
			`Click tracking ${value ? "enabled" : "disabled"}`,
		);
	};

	const onToggleOpenTracking = (value: boolean) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ isOpenTrackingEnabled: value },
			`Open tracking ${value ? "enabled" : "disabled"}`,
		);
	};

	const onTLSChange = (value: string) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ tls: value as "opportunistic" | "enforced" },
			`TLS mode updated to ${value === "enforced" ? "Enforced" : "Opportunistic"}`,
		);
	};

	return (
		<div className="mt-7 mb-24 space-y-7">
			{/* Enable tracking metrics */}
			<div className="space-y-3">
				<div className="space-y-1">
					<h3 className="font-semibold text-sm text-text-strong-950">
						Enable tracking metrics
					</h3>
					<p className="text-paragraph-xs text-text-sub-600 leading-relaxed max-w-2xl">
						To track clicks and email opens, configure a custom tracking subdomain to let those links match your sending domain and improve deliverability.
					</p>
				</div>
				{domain && (
					<div className="flex items-center gap-2">
						<div className="flex h-9 items-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50/30 px-3 font-mono text-sm text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
							{domain.trackingSubdomain}.{domain.domain}
						</div>
						<button
							onClick={() =>
								copyToClipboard(
									`${domain.trackingSubdomain}.${domain.domain}`,
									"tracking-domain",
								)
							}
							className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20 shadow-sm"
							title="Copy domain to clipboard"
						>
							{copiedItems.has("tracking-domain") ? (
								<Icon name="check" className="h-4 w-4 text-success-base" />
							) : (
								<Icon name="copy" className="h-4 w-4" />
							)}
						</button>
					</div>
				)}
			</div>

			{/* Click tracking */}
			<div className="space-y-3 pt-6 border-t border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<div className="space-y-1">
					<h3 className="font-semibold text-sm text-text-strong-950">
						Click tracking
					</h3>
					<p className="text-paragraph-xs text-text-sub-600 leading-relaxed max-w-2xl">
						To track clicks, Reloop rewrites each link in your email to pass through our servers. When a recipient clicks a link, they are immediately redirected to the original destination URL.
					</p>
				</div>
				<Switch.Root
					checked={domain?.isClickTrackingEnabled ?? false}
					onCheckedChange={onToggleClickTracking}
					disabled={isLoading}
				/>
			</div>

			{/* Open tracking */}
			<div className="space-y-3 pt-6 border-t border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<div className="space-y-1">
					<h3 className="font-semibold text-sm text-text-strong-950">
						Open tracking
					</h3>
					<p className="text-paragraph-xs text-text-sub-600 leading-relaxed max-w-2xl">
						A 1x1 pixel transparent GIF image is inserted in each email and includes a unique reference. Open tracking can produce inaccurate results.
					</p>
				</div>
				<Switch.Root
					checked={domain?.isOpenTrackingEnabled ?? false}
					onCheckedChange={onToggleOpenTracking}
					disabled={isLoading}
				/>
			</div>

			{/* TLS Mode */}
			<div className="space-y-3 pt-6 border-t border-stroke-soft-100 dark:border-stroke-soft-100/40">
				<div className="space-y-1">
					<h3 className="font-semibold text-sm text-text-strong-950">
						TLS (Transport Layer Security)
					</h3>
					<p className="text-paragraph-xs text-text-sub-600 leading-relaxed max-w-2xl">
						&ldquo;Opportunistic TLS&rdquo; means that it always attempts to make a secure connection to the receiving mail server. If it can&apos;t establish a secure connection, it sends the message unencrypted. &ldquo;Enforced TLS&rdquo; on the other hand, requires that the email communication must use TLS no matter what.
					</p>
				</div>
				<div className="w-[180px] pt-1">
					<Select.Root
						value={domain?.tls ?? "opportunistic"}
						onValueChange={onTLSChange}
						disabled={isLoading}
						size="small"
					>
						<Select.Trigger className="w-full">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="opportunistic">Opportunistic</Select.Item>
							<Select.Item value="enforced">Enforced</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>
	);
};
