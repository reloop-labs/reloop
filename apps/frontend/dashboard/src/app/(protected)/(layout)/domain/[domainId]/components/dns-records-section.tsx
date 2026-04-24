"use client";

import type { DomainResponse } from "@reloop/api";
import * as Switch from "@reloop/ui/switch";
import { toast } from "sonner";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DNSRecordTable } from "./dns-record-table";

interface DNSRecordsSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
	handleUpdateDomain?: (
		payload: Partial<Pick<DomainResponse, "sendingEmail" | "receivingEmail">>,
		successMessage: string,
	) => Promise<void>;
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
}

export const DNSRecordsSection = ({
	domain,
	isLoading,
	handleUpdateDomain,
	onCopyToClipboard,
	copiedItems = new Set(),
}: DNSRecordsSectionProps) => {
	const { sendingRecords, receivingRecords, dmarcRecords } =
		groupDomainDnsRecords(domain?.dnsRecords);

	const onToggleSending = (value: boolean) => {
		if (!handleUpdateDomain) return;

		if (!value && !domain?.receivingEmail) {
			toast.error("At least one of Sending or Receiving must be enabled");
			return;
		}

		handleUpdateDomain(
			{ sendingEmail: value },
			`Sending email ${value ? "enabled" : "disabled"}`,
		);
	};

	const onToggleReceiving = (value: boolean) => {
		if (!handleUpdateDomain) return;

		if (!value && !domain?.sendingEmail) {
			toast.error("At least one of Sending or Receiving must be enabled");
			return;
		}

		handleUpdateDomain(
			{ receivingEmail: value },
			`Receiving email ${value ? "enabled" : "disabled"}`,
		);
	};

	return (
		<div className="mb-24">
			{/* Sending Email Section */}
			<div className="mb-10">
				<div className="mb-6 flex items-start justify-between gap-4">
					<div className="space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							Sending Email{" "}
							<span className="text-text-sub-600 text-xs">(Required)</span>
						</div>
						<div className="text-text-sub-600 text-xs">
							Enable email signing and specify authorized senders.
						</div>
					</div>
					<Switch.Root
						checked={domain?.sendingEmail ?? true}
						onCheckedChange={onToggleSending}
						disabled={isLoading}
						checkedColor="orange"
					/>
				</div>
				<DNSRecordTable
					records={sendingRecords}
					onCopyToClipboard={onCopyToClipboard}
					copiedItems={copiedItems}
					isLoading={isLoading}
					loadingRows={4}
					tableId="dkim-"
				/>
			</div>

			{/* Receiving Email Section */}
			{receivingRecords.length > 0 && (
				<div className="mb-10">
					<div className="mb-6 flex items-start justify-between gap-4">
						<div className="space-y-1">
							<div className="font-medium text-sm text-text-strong-950">
								Receiving Email{" "}
								<span className="text-text-sub-600 text-xs">(Optional)</span>
							</div>
							<div className="text-text-sub-600 text-xs">
								Route inbound mail to your receiving mail host.
							</div>
						</div>
						<Switch.Root
							checked={domain?.receivingEmail ?? true}
							onCheckedChange={onToggleReceiving}
							disabled={isLoading}
							checkedColor="orange"
						/>
					</div>
					<DNSRecordTable
						records={receivingRecords}
						onCopyToClipboard={onCopyToClipboard}
						copiedItems={copiedItems}
						isLoading={isLoading}
						loadingRows={1}
						tableId="receiving-"
					/>
				</div>
			)}

			{/* DMARC Section */}
			<div>
				<div className="mb-6 space-y-1">
					<div className="font-medium text-sm text-text-strong-950">
						DMARC{" "}
						<span className="text-text-sub-600 text-xs">(Recommended)</span>
					</div>
					<div className="text-text-sub-600 text-xs">
						Set authentication policies and receive reports.
					</div>
				</div>
				<DNSRecordTable
					records={dmarcRecords}
					onCopyToClipboard={onCopyToClipboard}
					copiedItems={copiedItems}
					isLoading={isLoading}
					loadingRows={1}
					tableId="dmarc-"
				/>
			</div>
		</div>
	);
};
