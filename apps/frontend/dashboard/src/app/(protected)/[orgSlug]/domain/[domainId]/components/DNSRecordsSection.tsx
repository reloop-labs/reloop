"use client";

import type { DNSRecord } from "@reloop/api/types";
import { DNSRecordTable } from "./DNSRecordTable";

interface DNSRecordsSectionProps {
	sendingRecords: DNSRecord[];
	receivingRecords: DNSRecord[];
	dmarcRecords: DNSRecord[];
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
	isLoading?: boolean;
}

export const DNSRecordsSection = ({
	sendingRecords,
	receivingRecords,
	dmarcRecords,
	onCopyToClipboard,
	copiedItems = new Set(),
	isLoading,
}: DNSRecordsSectionProps) => {
	return (
		<div className="mb-24">
			{/* DKIM and SPF Section */}
			<div className="mb-10">
				<div className="mb-6 space-y-1">
					<div className="font-medium text-sm text-text-strong-950">
						DKIM and SPF{" "}
						<span className="text-text-sub-600 text-xs">(Required)</span>
					</div>
					<div className="text-text-sub-600 text-xs">
						Enable email signing and specify authorized senders.
					</div>
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
					<div className="mb-6 space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							Receiving Email{" "}
							<span className="text-text-sub-600 text-xs">(Optional)</span>
						</div>
						<div className="text-text-sub-600 text-xs">
							Route inbound mail to your receiving mail host.
						</div>
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
