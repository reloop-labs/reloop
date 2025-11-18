"use client";

import type { DNSRecord } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { DNSRecordTable } from "./DNSRecordTable";

interface DNSRecordsSectionProps {
	dkimSpfRecords: DNSRecord[];
	dmarcRecords: DNSRecord[];
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
	isLoading?: boolean;
}

export const DNSRecordsSection = ({
	dkimSpfRecords,
	dmarcRecords,
	onCopyToClipboard,
	copiedItems = new Set(),
	isLoading,
}: DNSRecordsSectionProps) => {
	return (
		<div className="mb-24">
			<div className="flex items-center justify-between">
				<p className="font-medium text-lg">DNS Records</p>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={() =>
						window.open(
							"https://reloop.sh/docs/domain#add-dns-records",
							"_blank",
						)
					}
					className="gap-2"
				>
					<Icon name="file-text" className="h-4 w-4" />
					How to add records
				</Button.Root>
			</div>
			<div className="mt-6 mb-8">
				<div className="mb-4">
					<h3 className="font-medium text-sm">
						DKIM and SPF{" "}
						<span className="font-normal text-text-sub-600">(Required)</span>
					</h3>
					<p className="text-sm text-text-sub-600">
						Enable email signing and specify authorized senders.
					</p>
				</div>
				<DNSRecordTable
					records={dkimSpfRecords}
					onCopyToClipboard={onCopyToClipboard}
					copiedItems={copiedItems}
					isLoading={isLoading}
					loadingRows={4}
				/>
			</div>
			<div>
				<div className="mb-4">
					<h3 className="font-medium text-sm">
						DMARC{" "}
						<span className="font-normal text-text-sub-600">(Recommended)</span>
					</h3>
					<p className="text-sm text-text-sub-600">
						Set authentication policies and receive reports.
					</p>
				</div>
				<DNSRecordTable
					records={dmarcRecords}
					onCopyToClipboard={onCopyToClipboard}
					copiedItems={copiedItems}
					isLoading={isLoading}
					loadingRows={1}
				/>
			</div>
		</div>
	);
};
