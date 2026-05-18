"use client";

import type { DNSRecord, DomainResponse } from "@fe/dashboard/types/api.types";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import { useDomainActions } from "../hooks/use-domain-actions";
import { DNSAutoConnectBanner } from "./dns-auto-connect-banner";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DNSRecordTable } from "./dns-record-table";

interface DNSRecordsSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
}

export const DNSRecordsSection = ({
	domain,
	isLoading,
}: DNSRecordsSectionProps) => {
	const {
		dkimRecords,
		sendingRecords,
		receivingRecords,
		trackingRecords,
		dmarcRecords,
	} = groupDomainDnsRecords(domain?.dnsRecords);

	const { handleUpdateDomain } = useDomainActions(domain?.id, domain);

	return (
		<div className="mt-6 mb-24 flex flex-col">
			{domain?.status && <DNSAutoConnectBanner domain={domain} />}

			{/* Domain Verification Group */}
			<div className="my-6">
				<div className="mb-4 flex items-center gap-2 text-base text-text-strong-950">
					<h3 className="font-semibold">Domain Verification</h3>
					<Icon name="shield" className="h-4 w-4 text-text-sub-600" />
				</div>
				<DNSRecordSectionGroup
					title="DKIM"
					docsUrl="https://reloop.sh/docs/dns/dkim"
					records={dkimRecords}
					isLoading={!!isLoading}
					tableId="dkim-"
				/>
			</div>

			{/* Enable Sending Group */}
			<div className="mb-6 border-stroke-soft-100 border-t pt-6 dark:border-stroke-soft-100/10">
				<div className="flex items-center justify-between">
					<h3 className="flex items-center gap-2 font-semibold text-base text-text-strong-950">
						<Icon name="send-1" className="h-4 w-4 text-text-sub-600" />
						Enable Sending
					</h3>
					<Switch.Root
						checked={domain?.isSendingEmailEnabled}
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
					{domain?.isSendingEmailEnabled && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="mt-4 overflow-hidden"
						>
							<div>
								<DNSRecordSectionGroup
									title="SPF"
									docsUrl="https://reloop.sh/docs/dns/spf"
									records={sendingRecords}
									isLoading={!!isLoading}
									tableId="spf-"
								/>

								<DNSRecordSectionGroup
									title="DMARC (Optional)"
									docsUrl="https://reloop.sh/docs/dns/dmarc"
									records={dmarcRecords}
									isLoading={!!isLoading}
									tableId="dmarc-"
									className="mt-7"
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Enable Receiving Group */}
			{receivingRecords.length > 0 && (
				<div className="mb-6 border-stroke-soft-100 border-t pt-6 dark:border-stroke-soft-100/10">
					<div className="flex items-center justify-between">
						<h3 className="flex items-center gap-2 font-semibold text-base text-text-strong-950">
							<Icon name="inbox" className="h-4 w-4 text-text-sub-600" />
							Enable Receiving
						</h3>
						<Switch.Root
							checked={domain?.isReceivingEmailEnabled}
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
						{domain?.isReceivingEmailEnabled && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.2, ease: "easeInOut" }}
								className="mt-4 overflow-hidden"
							>
								<div>
									<DNSRecordSectionGroup
										title="MX"
										docsUrl="https://reloop.sh/docs/dns/mx"
										records={receivingRecords}
										isLoading={!!isLoading}
										tableId="mx-"
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}

			{/* Tracking Group */}
			{trackingRecords.length > 0 && (
				<div className="border-stroke-soft-100 border-t pt-6 dark:border-stroke-soft-100/10">
					<div className="flex items-center justify-between">
						<h3 className="flex items-center gap-2 font-semibold text-base text-text-strong-950">
							<Icon name="graph-up" className="h-4 w-4 text-text-sub-600" />
							Tracking
						</h3>
						<Switch.Root
							checked={
								domain?.isClickTrackingEnabled || domain?.isOpenTrackingEnabled
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
						{(domain?.isClickTrackingEnabled ||
							domain?.isOpenTrackingEnabled) && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.2, ease: "easeInOut" }}
								className="mt-4 overflow-hidden"
							>
								<div>
									<DNSRecordSectionGroup
										title="CNAME"
										docsUrl="https://reloop.sh/docs/dns/cname"
										records={trackingRecords}
										isLoading={!!isLoading}
										tableId="cname-"
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
};

interface DNSRecordSectionGroupProps {
	title: string;
	docsUrl: string;
	records: DNSRecord[];
	isLoading: boolean;
	tableId: string;
	className?: string;
}

const DNSRecordSectionGroup = ({
	title,
	docsUrl,
	records,
	isLoading,
	tableId,
	className,
}: DNSRecordSectionGroupProps) => {
	return (
		<div className={className}>
			<div className="mb-3 flex items-start justify-between gap-4">
				<div className="space-y-1">
					<a
						href={docsUrl}
						target="_blank"
						className="group flex items-center gap-1 hover:underline"
					>
						<span className="font-medium text-sm text-text-strong-950">
							{title}
						</span>
						<Icon
							name="arrow-top-right"
							className="h-2.5 w-2.5 stroke-[2.5] text-text-sub-600"
						/>
					</a>
				</div>
			</div>
			<DNSRecordTable
				records={records}
				isLoading={isLoading}
				loadingRows={records.length || 1}
				tableId={tableId}
			/>
		</div>
	);
};
