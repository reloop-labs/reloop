"use client";

import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { Icon } from "@reloop/ui/icon";
import * as Select from "@reloop/ui/select";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useClipboard } from "../hooks/use-clipboard";
import { useDomainActions } from "../hooks/use-domain-actions";

interface DomainConfigurationSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
}

export const DomainConfigurationSection = ({
	domain,
	isLoading,
}: DomainConfigurationSectionProps) => {
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

	const isClickTrackingEnabled = domain?.isClickTrackingEnabled ?? false;
	const isOpenTrackingEnabled = domain?.isOpenTrackingEnabled ?? false;

	return (
		<div className="mt-6 mb-24 space-y-6">
			{/* Tracking Domain Card */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/10">
				<div className="mb-3 flex items-center gap-2 text-base text-text-strong-950">
					<Icon name="globe" className="h-4 w-4 text-text-sub-600" />
					<h3 className="font-semibold text-sm">Tracking Domain</h3>
				</div>
				<div className="space-y-3">
					<p className="max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
						To track clicks and email opens, configure a custom tracking
						subdomain to let those links match your sending domain and improve
						deliverability.
					</p>
					{domain && (
						<div className="flex items-center gap-2">
							<div className="flex h-7 items-center rounded-lg border border-stroke-soft-100 bg-bg-weak-50/30 px-3 font-mono text-sm text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/50">
								{domain.trackingSubdomain}.{domain.domain}
							</div>
							<button
								type="button"
								onClick={() =>
									copyToClipboard(
										`${domain.trackingSubdomain}.${domain.domain}`,
										"tracking-domain",
									)
								}
								className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20"
								title="Copy domain to clipboard"
							>
								{copiedItems.has("tracking-domain") ? (
									<Icon
										name="check"
										className="h-3.5 w-3.5 text-success-base"
									/>
								) : (
									<Icon name="copy" className="h-3.5 w-3.5" />
								)}
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Click Tracking Card */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/10">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-base text-text-strong-950">
						<Icon name="link" className="h-4 w-4 text-text-sub-600" />
						<h3 className="font-semibold text-sm">Click Tracking</h3>
					</div>
					<Switch.Root
						checked={isClickTrackingEnabled}
						onCheckedChange={onToggleClickTracking}
						disabled={isLoading}
					/>
				</div>
				<AnimatePresence initial={false}>
					{isClickTrackingEnabled && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="mt-3 overflow-hidden"
						>
							<p className="max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
								To track clicks, Reloop rewrites each link in your email to pass
								through our servers. When a recipient clicks a link, they are
								immediately redirected to the original destination URL.
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Open Tracking Card */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/10">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-base text-text-strong-950">
						<Icon name="mail-single" className="h-4 w-4 text-text-sub-600" />
						<h3 className="font-semibold text-sm">Open Tracking</h3>
					</div>
					<Switch.Root
						checked={isOpenTrackingEnabled}
						onCheckedChange={onToggleOpenTracking}
						disabled={isLoading}
					/>
				</div>
				<AnimatePresence initial={false}>
					{isOpenTrackingEnabled && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="mt-3 overflow-hidden"
						>
							<p className="max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
								A 1x1 pixel transparent GIF image is inserted in each email and
								includes a unique reference. Open tracking can produce
								inaccurate results.
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* TLS Mode Card */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/10">
				<div className="mb-3 flex items-center gap-2 text-base text-text-strong-950">
					<Icon name="lock" className="h-4 w-4 text-text-sub-600" />
					<h3 className="font-semibold text-sm">
						TLS (Transport Layer Security)
					</h3>
				</div>
				<div className="space-y-4">
					<p className="max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
						&ldquo;Opportunistic TLS&rdquo; means that it always attempts to
						make a secure connection to the receiving mail server. If it
						can&apos;t establish a secure connection, it sends the message
						unencrypted. &ldquo;Enforced TLS&rdquo; on the other hand, requires
						that the email communication must use TLS no matter what.
					</p>
					<div className="w-[180px]">
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
		</div>
	);
};
