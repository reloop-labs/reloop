import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { DomainResponse } from "#/features/domain/types";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useClipboard } from "../hooks/use-clipboard";
import { useDomainActions } from "../hooks/use-domain-actions";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DNSRecordTable } from "./dns-record-table";

interface DomainConfigurationSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
}

export const DomainConfigurationSection = ({
	domain,
	domainId: domainIdProp,
	isLoading,
}: DomainConfigurationSectionProps & { domainId?: string }) => {
	const domainId = domainIdProp || domain?.id;
	const { handleUpdateDomain } = useDomainActions(domainId, domain);
	const { copiedItems, copyToClipboard } = useClipboard();
	const { trackingRecords } = useMemo(
		() => groupDomainDnsRecords(domain?.dnsRecords),
		[domain?.dnsRecords],
	);

	const [isTLSOpen, setIsTLSOpen] = useState(false);
	const [tlsHoverIdx, setTlsHoverIdx] = useState<number | undefined>(undefined);
	const tlsButtonRefs = useRef<HTMLButtonElement[]>([]);

	const tlsActiveIdx = tlsHoverIdx;
	const currentTLSTab =
		tlsActiveIdx !== undefined
			? tlsButtonRefs.current[tlsActiveIdx]
			: undefined;
	const currentTLSRect = currentTLSTab?.getBoundingClientRect();

	const [isClickTrackingPending, setIsClickTrackingPending] = useState(false);
	const [isOpenTrackingPending, setIsOpenTrackingPending] = useState(false);
	const [clickTrackingFlash, setClickTrackingFlash] = useState(false);
	const [openTrackingFlash, setOpenTrackingFlash] = useState(false);

	const onToggleClickTracking = async (value: boolean) => {
		if (!handleUpdateDomain || isClickTrackingPending) return;

		setIsClickTrackingPending(true);
		try {
			await handleUpdateDomain(
				{ isClickTrackingEnabled: value },
				`Click tracking ${value ? "enabled" : "disabled"}`,
				`${value ? "Enabling" : "Disabling"} click tracking...`,
			);
			setClickTrackingFlash(true);
			setTimeout(() => setClickTrackingFlash(false), 400);
		} finally {
			setIsClickTrackingPending(false);
		}
	};

	const onToggleOpenTracking = async (value: boolean) => {
		if (!handleUpdateDomain || isOpenTrackingPending) return;

		setIsOpenTrackingPending(true);
		try {
			await handleUpdateDomain(
				{ isOpenTrackingEnabled: value },
				`Open tracking ${value ? "enabled" : "disabled"}`,
				`${value ? "Enabling" : "Disabling"} open tracking...`,
			);
			setOpenTrackingFlash(true);
			setTimeout(() => setOpenTrackingFlash(false), 400);
		} finally {
			setIsOpenTrackingPending(false);
		}
	};

	const onTLSChange = (value: string) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ tls: value as "opportunistic" | "enforced" },
			`TLS mode updated to ${value === "enforced" ? "Enforced" : "Opportunistic"}`,
			"Updating TLS mode...",
		);
	};

	const isClickTrackingEnabled = domain?.isClickTrackingEnabled ?? false;
	const isOpenTrackingEnabled = domain?.isOpenTrackingEnabled ?? false;
	const trackingEnabled = isClickTrackingEnabled || isOpenTrackingEnabled;

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

			{/* Combined Click + Open Tracking Card */}
			<div className="rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/10">
				<div className="mb-3 flex items-center gap-2 text-base text-text-strong-950">
					<Icon name="graph-up" className="h-4 w-4 text-text-sub-600" />
					<h3 className="font-semibold text-sm">Click & Open Tracking</h3>
				</div>
				<p className="mb-4 max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
					Click and open tracking share one CNAME record. Enable either feature,
					then add the record below at your DNS provider.
				</p>

				<div className="space-y-3">
					{/* Click Tracking toggle row */}
					<div
						onClick={() =>
							!isLoading &&
							!isClickTrackingPending &&
							onToggleClickTracking(!isClickTrackingEnabled)
						}
						className={cn(
							"cursor-pointer select-none rounded-xl border border-stroke-soft-100 p-3 transition-colors duration-300 hover:bg-bg-weak-50/10 dark:border-stroke-soft-100/10 dark:hover:bg-bg-weak-50/5",
							clickTrackingFlash && "bg-success-base/10 dark:bg-success-base/20",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-base text-text-strong-950">
								<Icon name="link" className="h-4 w-4 text-text-sub-600" />
								<span className="font-semibold text-sm">Click Tracking</span>
							</div>
							<div onClick={(e) => e.stopPropagation()}>
								<Switch.Root
									checked={isClickTrackingEnabled}
									onCheckedChange={onToggleClickTracking}
									disabled={isLoading || isClickTrackingPending}
									isPending={isClickTrackingPending}
								/>
							</div>
						</div>
						<p className="mt-2 max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
							Rewrites links in your email so clicks pass through Reloop, then
							redirect to the original URL.
						</p>
					</div>

					{/* Open Tracking toggle row */}
					<div
						onClick={() =>
							!isLoading &&
							!isOpenTrackingPending &&
							onToggleOpenTracking(!isOpenTrackingEnabled)
						}
						className={cn(
							"cursor-pointer select-none rounded-xl border border-stroke-soft-100 p-3 transition-colors duration-300 hover:bg-bg-weak-50/10 dark:border-stroke-soft-100/10 dark:hover:bg-bg-weak-50/5",
							openTrackingFlash && "bg-success-base/10 dark:bg-success-base/20",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-base text-text-strong-950">
								<Icon
									name="mail-single"
									className="h-4 w-4 text-text-sub-600"
								/>
								<span className="font-semibold text-sm">Open Tracking</span>
							</div>
							<div onClick={(e) => e.stopPropagation()}>
								<Switch.Root
									checked={isOpenTrackingEnabled}
									onCheckedChange={onToggleOpenTracking}
									disabled={isLoading || isOpenTrackingPending}
									isPending={isOpenTrackingPending}
								/>
							</div>
						</div>
						<p className="mt-2 max-w-2xl text-paragraph-xs text-text-sub-600 leading-relaxed">
							Inserts a 1×1 transparent pixel with a unique reference. Results
							can be inaccurate.
						</p>
					</div>
				</div>

				<AnimatePresence initial={false}>
					{(trackingEnabled || trackingRecords.length > 0) && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="mt-4 overflow-hidden"
						>
							<div className="mb-3 flex items-start justify-between gap-4">
								<a
									href="https://reloop.sh/docs/dns/cname"
									target="_blank"
									rel="noreferrer"
									className="group flex items-center gap-1 hover:underline"
								>
									<span className="font-medium text-sm text-text-strong-950">
										CNAME
									</span>
									<Icon
										name="arrow-up-right"
										className="h-2.5 w-2.5 stroke-[2.5] text-text-sub-600"
									/>
								</a>
							</div>
							<DNSRecordTable
								records={trackingRecords}
								isLoading={!!isLoading}
								loadingRows={trackingRecords.length || 1}
								tableId="config-cname-"
							/>
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
					<div className="w-[200px]">
						<Dropdown.Root open={isTLSOpen} onOpenChange={setIsTLSOpen}>
							<Dropdown.Trigger asChild>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="small"
									disabled={isLoading}
									className="w-full justify-between gap-1.5 whitespace-nowrap rounded-xl! px-2.5 py-2"
								>
									<div className="flex items-center gap-2 overflow-hidden">
										<Icon
											name={
												domain?.tls === "enforced" ? "shield-check" : "shield"
											}
											className="h-4 w-4 shrink-0 text-text-sub-600"
										/>
										<span className="truncate font-medium text-sm">
											{domain?.tls === "enforced"
												? "Enforced"
												: "Opportunistic"}
										</span>
									</div>
									<Icon
										name="chevron-down"
										className="h-4 w-4 shrink-0 text-text-sub-600 transition duration-200 group-data-[state=open]/trigger:rotate-180"
									/>
								</Button.Root>
							</Dropdown.Trigger>
							<Dropdown.Content align="start" className="w-[320px] p-2">
								<div className="relative flex flex-col gap-1">
									<button
										ref={(el) => {
											if (el) tlsButtonRefs.current[0] = el;
										}}
										type="button"
										onPointerEnter={() => setTlsHoverIdx(0)}
										onPointerLeave={() => setTlsHoverIdx(undefined)}
										onClick={() => {
											onTLSChange("opportunistic");
											setIsTLSOpen(false);
										}}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-1.5 font-normal text-xs transition-colors",
											"text-text-strong-950",
											domain?.tls !== "enforced" && "bg-neutral-alpha-10",
										)}
									>
										<div className="flex items-start gap-2.5 py-1">
											<Icon
												name="shield"
												className="mt-0.5 h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<div className="flex flex-col gap-0.5 text-left">
												<span className="font-medium text-sm text-text-strong-950">
													Opportunistic
												</span>
												<span className="whitespace-normal text-paragraph-xs text-text-sub-600 leading-normal">
													Always attempts secure connection, falls back to
													unencrypted if unsupported.
												</span>
											</div>
										</div>
										{domain?.tls !== "enforced" && (
											<Icon
												name="check"
												className="h-4 w-4 shrink-0 self-center text-text-strong-950"
											/>
										)}
									</button>

									<button
										ref={(el) => {
											if (el) tlsButtonRefs.current[1] = el;
										}}
										type="button"
										onPointerEnter={() => setTlsHoverIdx(1)}
										onPointerLeave={() => setTlsHoverIdx(undefined)}
										onClick={() => {
											onTLSChange("enforced");
											setIsTLSOpen(false);
										}}
										className={cn(
											"flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-1.5 font-normal text-xs transition-colors",
											"text-text-strong-950",
											domain?.tls === "enforced" && "bg-neutral-alpha-10",
										)}
									>
										<div className="flex items-start gap-2.5 py-1">
											<Icon
												name="shield-check"
												className="mt-0.5 h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<div className="flex flex-col gap-0.5 text-left">
												<span className="font-medium text-sm text-text-strong-950">
													Enforced
												</span>
												<span className="whitespace-normal text-paragraph-xs text-text-sub-600 leading-normal">
													Requires secure connection. Emails will bounce if
													receiver doesn't support TLS.
												</span>
											</div>
										</div>
										{domain?.tls === "enforced" && (
											<Icon
												name="check"
												className="h-4 w-4 shrink-0 self-center text-text-strong-950"
											/>
										)}
									</button>

									<AnimatedHoverBackground
										rect={currentTLSRect}
										tabElement={currentTLSTab}
										className="rounded-2xl"
									/>
								</div>
							</Dropdown.Content>
						</Dropdown.Root>
					</div>
				</div>
			</div>
		</div>
	);
};
