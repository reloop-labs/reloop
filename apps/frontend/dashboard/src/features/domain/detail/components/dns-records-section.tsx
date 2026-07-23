import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion } from "framer-motion";
import type { DNSRecord, DomainResponse } from "#/features/domain/types";
import { useDomainActions } from "../hooks/use-domain-actions";
import { DNSAutoConnectBanner } from "./dns-auto-connect-banner";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DNSRecordTable } from "./dns-record-table";

interface DNSRecordsSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
	className?: string;
	showAutoConnectBanner?: boolean;
}

export const DNSRecordsSection = ({
	domain,
	isLoading,
	className,
	showAutoConnectBanner = true,
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
		<div
			className={cn(
				"mt-6 mb-24 flex flex-col space-y-6",
				className,
			)}
		>
			{showAutoConnectBanner && domain?.status && (
				<DNSAutoConnectBanner domain={domain} />
			)}

			{/* Domain Verification Group */}
			<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
				<div className="mb-4 flex items-center gap-2 text-base text-text-strong-950">
					<Icon name="shield" className="h-4 w-4 text-text-sub-600" />
					<h3 className="font-semibold">Domain Verification</h3>
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
			<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-base text-text-strong-950">
						<Icon name="mail-send" className="h-4 w-4 text-text-sub-600" />
						<h3 className="font-semibold">Email Sending</h3>
					</div>
					<Switch.Root
						checked={domain?.isSendingEmailEnabled}
						onCheckedChange={(checked) =>
							handleUpdateDomain(
								{ isSendingEmailEnabled: checked },
								checked
									? "Sending enabled successfully"
									: "Sending disabled successfully",
								checked
									? "Enabling email sending..."
									: "Disabling email sending...",
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
				<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-base text-text-strong-950">
							<Icon name="mail-receive" className="h-4 w-4 text-text-sub-600" />
							<h3 className="font-semibold">Email Receiving</h3>
						</div>
						<Switch.Root
							checked={domain?.isReceivingEmailEnabled}
							onCheckedChange={(checked) =>
								handleUpdateDomain(
									{ isReceivingEmailEnabled: checked },
									checked
										? "Receiving enabled successfully"
										: "Receiving disabled successfully",
									checked
										? "Enabling email receiving..."
										: "Disabling email receiving...",
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
				<div className="rounded-2xl border border-stroke-soft-100 p-4 dark:border-stroke-soft-100/10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-base text-text-strong-950">
							<Icon name="graph-up" className="h-4 w-4 text-text-sub-600" />
							<h3 className="font-semibold">Tracking</h3>
						</div>
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
							name="arrow-up-right"
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
