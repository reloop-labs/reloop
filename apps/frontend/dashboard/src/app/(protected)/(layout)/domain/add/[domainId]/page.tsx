"use client";
import type { DomainResponse } from "@fe/dashboard/types/api.types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Switch from "@reloop/ui/switch";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { DNSAutoConnectBanner } from "../../[domainId]/components/dns-auto-connect-banner";
import { groupDomainDnsRecords } from "../../[domainId]/components/dns-record-groups";
import { useDomainActions } from "../../[domainId]/hooks/use-domain-actions";
import { DomainNotFound } from "../../components/domain-not-found";
import { DNSRecordSection } from "./components/dns-record-section";
import { ForwardDNSRecordsButton } from "./components/forward-dns-records";

const NewDomainPage = () => {
	const [isVerifying, setIsVerifying] = React.useState(false);
	const { domainId } = useParams();
	const router = useRouter();

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		`/api/domain/v1/${domainId}`,
	);

	const { handleUpdateDomain } = useDomainActions(
		domainId as string,
		domainData,
	);

	useHotkeys("esc", () => {
		router.push("/domain");
	});

	useHotkeys("mod+enter", (e) => {
		e.preventDefault();
		handleVerifyAndNavigate();
	});

	const handleVerifyAndNavigate = async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				headers: { credentials: "include" },
			});
			await mutate(`/api/domain/v1/${domainId}`);
			await mutate(
				(key) =>
					typeof key === "string" && key.startsWith("/api/domain/v1/list"),
			);
			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
			router.push("/domain");
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	if (
		(!domainData ||
			!domainData.dnsRecords ||
			domainData.dnsRecords.length === 0) &&
		!isLoading
	) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<DomainNotFound />
			</div>
		);
	}

	const {
		sendingRecords,
		receivingRecords,
		dkimRecords,
		dmarcRecords,
		trackingRecords,
	} = groupDomainDnsRecords(domainData?.dnsRecords);

	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
			<div className="flex w-full items-center justify-between pb-6">
				<div>
					<h1 className="flex items-center gap-2 font-semibold text-title-h5 leading-8">
						{domainData?.domain || <Skeleton className="h-6 w-48" />}
						<Icon name="check-circle" className="size-5 text-warning-base" />
					</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Successfully added and ready for DNS configuration
					</p>
				</div>
				{domainId && (
					<div className="flex items-center gap-2">
						<ForwardDNSRecordsButton domainId={domainId as string} />
					</div>
				)}
			</div>

			<div className="relative mb-10 flex flex-col">
				<DNSAutoConnectBanner domain={domainData} />

				{/* Domain Verification Group */}
				<div className="my-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
					<div className="mb-4 flex items-center gap-2 text-base text-text-strong-950">
						<Icon name="shield" className="h-4 w-4 text-text-sub-600" />
						<h3 className="font-semibold">Domain Verification</h3>
					</div>
					{dkimRecords.length > 0 && (
						<DNSRecordSection
							title="DKIM"
							records={dkimRecords}
							isLoading={isLoading}
							docsUrl="https://reloop.sh/docs/dns/dkim"
							tableId="dkim-"
						/>
					)}
				</div>

				{/* Enable Sending Group */}
				<div className="mb-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-base text-text-strong-950">
							<Icon name="mail-single" className="h-4 w-4 text-text-sub-600" />
							<h3 className="font-semibold">Enable Sending</h3>
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
								transition={{ duration: 0.2, ease: "easeInOut" }}
								className="mt-4 overflow-hidden"
							>
								<div>
									<DNSRecordSection
										title="SPF"
										records={sendingRecords}
										isLoading={isLoading}
										docsUrl="https://reloop.sh/docs/dns/spf"
										tableId="spf-"
									/>
									{dmarcRecords.length > 0 && (
										<DNSRecordSection
											loadingRows={2}
											title="DMARC (Optional)"
											records={dmarcRecords}
											isLoading={isLoading}
											docsUrl="https://reloop.sh/docs/dns/dmarc"
											tableId="dmarc-"
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
					<div className="mb-6 rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-base text-text-strong-950">
								<Icon name="inbox" className="h-4 w-4 text-text-sub-600" />
								<h3 className="font-semibold">Enable Receiving</h3>
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
									transition={{ duration: 0.2, ease: "easeInOut" }}
									className="mt-4 overflow-hidden"
								>
									<DNSRecordSection
										title="MX"
										records={receivingRecords}
										isLoading={isLoading}
										docsUrl="https://reloop.sh/docs/dns/mx"
										tableId="mx-"
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}

				{/* Tracking Group */}
				{trackingRecords.length > 0 && (
					<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
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
									transition={{ duration: 0.2, ease: "easeInOut" }}
									className="mt-4 overflow-hidden"
								>
									<DNSRecordSection
										title="CNAME"
										records={trackingRecords}
										isLoading={isLoading}
										docsUrl="https://reloop.sh/docs/dns/cname"
										tableId="cname-"
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)}
				<div className="flex items-center gap-3 pt-10">
					<Button.Root
						onClick={handleVerifyAndNavigate}
						size="xsmall"
						variant="neutral"
						disabled={isVerifying}
					>
						{isVerifying ? "Verifying..." : "Verify DNS Records"}
						<span className="flex items-center gap-0.5">
							<KbdCommand />
							<KbdEnter />
						</span>
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => router.push("/domain")}
						className="gap-1.5"
					>
						Skip
						<KbdEsc />
					</Button.Root>
				</div>
			</div>
		</div>
	);
};

export default NewDomainPage;
