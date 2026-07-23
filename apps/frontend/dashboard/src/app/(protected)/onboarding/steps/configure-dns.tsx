"use client";

import { DNSAutoConnectBanner } from "@fe/dashboard/app/(protected)/(layout)/domain/[domainId]/components/dns-auto-connect-banner";
import { useDomainActions } from "@fe/dashboard/app/(protected)/(layout)/domain/[domainId]/hooks/use-domain-actions";
import { DNSRecordSection } from "@fe/dashboard/app/(protected)/onboarding/steps/configure-dns/components/dns-record-section";
import { groupDomainDnsRecords } from "@fe/dashboard/app/(protected)/onboarding/steps/configure-dns/utils/dns-record-groups";
import type { DomainResponse } from "@fe/dashboard/types/api.types";
import {
	isDomainDetailSwrKey,
	isDomainListSwrKey,
} from "@fe/dashboard/utils/domain";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import * as Switch from "@reloop/ui/switch";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

function TwitterVerifiedIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={className ?? "size-6 shrink-0 text-text-sub-600"}
			fill="currentColor"
		>
			<path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zm-12.71 4.29l-3.58-3.59 1.41-1.41 2.17 2.17 6.18-6.18 1.41 1.41-7.59 7.6z" />
		</svg>
	);
}

export const ConfigureDnsStep = () => {
	const [domainId] = useQueryState("domainId", parseAsString.withDefault(""));
	const [, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [isVerifying, setIsVerifying] = React.useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	React.useEffect(() => {
		const dcStatus = searchParams?.get("dc_status");
		if (!dcStatus) return;

		switch (dcStatus) {
			case "success":
				toast.success(
					"DNS records configured successfully! Verification started.",
				);
				setStep(4);
				break;
			case "cancelled":
				toast.info(
					"Auto-configuration was cancelled. You can try again or configure manually.",
				);
				break;
			case "error": {
				const errorMsg =
					searchParams.get("dc_error") || "Auto-configuration failed";
				toast.error(errorMsg);
				break;
			}
		}

		// Clean query parameters from URL
		const url = new URL(window.location.href);
		url.searchParams.delete("dc_status");
		url.searchParams.delete("dc_error");
		router.replace(url.pathname + url.search, { scroll: false });
	}, [searchParams, router, setStep]);

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		domainId ? `/api/domain/v1/${domainId}` : null,
		{
			refreshInterval: (data) => (data?.status === "verifying" ? 3000 : 0),
		},
	);

	const { handleUpdateDomain } = useDomainActions(domainId, domainData);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {}
	};

	const handleVerifyDNS = async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				headers: { credentials: "include" },
			});
			await mutate((key) => isDomainDetailSwrKey(key, domainId));
			await mutate((key) => isDomainListSwrKey(key));
			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
			setStep(4);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	useHotkeys(
		"mod+enter",
		() => {
			if (!isVerifying) {
				handleVerifyDNS();
			}
		},
		{ enableOnFormTags: true },
	);

	useHotkeys("alt+s", (e) => {
		e.preventDefault();
		setStep(4);
	});

	const {
		sendingRecords,
		receivingRecords,
		dkimRecords,
		dmarcRecords,
		trackingRecords,
	} = groupDomainDnsRecords(domainData?.dnsRecords);

	if (!domainId && !isLoading) {
		return (
			<div>
				<p className="text-text-sub-600 outline-none">
					Please add a domain in the previous step.
				</p>
			</div>
		);
	}

	return (
		<div className="pb-10">
			<div className="relative mx-auto mb-8 flex flex-col">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							{domainData?.domain || (
								<Skeleton className="h-8 w-48 rounded-lg" />
							)}
						</h1>
						{domainData?.domain && (
							<TwitterVerifiedIcon className="size-6 shrink-0 text-text-sub-600" />
						)}
					</div>
					<p className="text-paragraph-md text-text-sub-600 leading-relaxed">
						Domain added · Copy the records below and add them to your DNS
						provider to start sending emails.
					</p>
				</div>
				<div className="mt-6">
					<DNSAutoConnectBanner domain={domainData} domainId={domainId || domainData?.id} forceShow />
				</div>

				{/* Domain Verification Group */}
				<div className="mt-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
					<div className="mb-4 flex items-center gap-2 text-base text-text-strong-950">
						<Icon name="shield" className="h-4 w-4 text-text-sub-600" />
						<h3 className="font-semibold">Domain Verification</h3>
					</div>
					{dkimRecords.length > 0 && (
						<DNSRecordSection
							title="DKIM"
							records={dkimRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							loadingRows={1}
							docsUrl="https://reloop.sh/docs/dns/dkim"
						/>
					)}
				</div>

				{/* Enable Sending Group */}
				<div className="mt-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-base text-text-strong-950">
							<Icon name="mail-send" className="h-4 w-4 text-text-sub-600" />
							<h3 className="font-semibold">Email Sending</h3>
						</div>
						<Switch.Root
							checked={domainData?.isSendingEmailEnabled}
							onCheckedChange={(checked) =>
								handleUpdateDomain(
									{ isSendingEmailEnabled: checked },
									checked
										? "Sending enabled successfully"
										: "Sending disabled successfully",
								)
							}
						/>
					</div>
					<AnimatePresence initial={false}>
						{domainData?.isSendingEmailEnabled && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
								className="mt-4 overflow-hidden"
							>
								<div className="space-y-6">
									<DNSRecordSection
										title="SPF"
										records={sendingRecords}
										onCopyToClipboard={copyToClipboard}
										isLoading={isLoading}
										loadingRows={1}
										docsUrl="https://reloop.sh/docs/dns/spf"
									/>
									{dmarcRecords.length > 0 && (
										<DNSRecordSection
											loadingRows={2}
											title="DMARC (Optional)"
											records={dmarcRecords}
											onCopyToClipboard={copyToClipboard}
											isLoading={isLoading}
											docsUrl="https://reloop.sh/docs/dns/dmarc"
											className="mt-7"
										/>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Enable Receiving Group */}
				{receivingRecords.length > 0 && (
					<div className="mt-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-base text-text-strong-950">
								<Icon
									name="mail-receive"
									className="h-4 w-4 text-text-sub-600"
								/>
								<h3 className="font-semibold">Email Receiving</h3>
							</div>
							<Switch.Root
								checked={domainData?.isReceivingEmailEnabled}
								onCheckedChange={(checked) =>
									handleUpdateDomain(
										{ isReceivingEmailEnabled: checked },
										checked
											? "Receiving enabled successfully"
											: "Receiving disabled successfully",
									)
								}
							/>
						</div>
						<AnimatePresence initial={false}>
							{domainData?.isReceivingEmailEnabled && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
									className="mt-4 overflow-hidden"
								>
									<DNSRecordSection
										title="MX"
										records={receivingRecords}
										onCopyToClipboard={copyToClipboard}
										isLoading={isLoading}
										loadingRows={1}
										docsUrl="https://reloop.sh/docs/dns/mx"
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}

				{/* Tracking Group */}
				{trackingRecords.length > 0 && (
					<div className="mt-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-base text-text-strong-950">
								<Icon name="graph-up" className="h-4 w-4 text-text-sub-600" />
								<h3 className="font-semibold">Tracking</h3>
							</div>
							<Switch.Root
								checked={
									domainData?.isClickTrackingEnabled ||
									domainData?.isOpenTrackingEnabled
								}
								onCheckedChange={(checked) =>
									handleUpdateDomain(
										{
											isClickTrackingEnabled: checked,
											isOpenTrackingEnabled: checked,
										},
										checked
											? "Tracking enabled successfully"
											: "Tracking disabled successfully",
									)
								}
							/>
						</div>
						<AnimatePresence initial={false}>
							{(domainData?.isClickTrackingEnabled ||
								domainData?.isOpenTrackingEnabled) && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
									className="mt-4 overflow-hidden"
								>
									<DNSRecordSection
										title="CNAME"
										records={trackingRecords}
										onCopyToClipboard={copyToClipboard}
										isLoading={isLoading}
										loadingRows={1}
										docsUrl="https://reloop.sh/docs/dns/cname"
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}
				<div className="mt-8 flex items-center justify-end gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => setStep(4)}
						className="gap-1.5"
					>
						Skip
						<span className="inline-flex items-center gap-0.5">
							<KbdKeyOutline>⌥</KbdKeyOutline>
							<KbdKeyOutline>S</KbdKeyOutline>
						</span>
					</Button.Root>
					<Button.Root
						onClick={handleVerifyDNS}
						size="xsmall"
						variant="neutral"
						disabled={isVerifying}
					>
						{isVerifying ? (
							<>
								<Spinner color="currentColor" />
								Verifying...
							</>
						) : (
							<>
								Verify DNS Records
								<span className="inline-flex items-center gap-0.5">
									<Icon
										name="command"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
									<Icon
										name="enter"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
								</span>
							</>
						)}
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
