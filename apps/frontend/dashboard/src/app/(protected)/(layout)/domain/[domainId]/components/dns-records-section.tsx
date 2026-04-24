"use client";

import type { DomainResponse } from "@reloop/api";
import type { DNSRecord } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DNSRecordTable } from "./dns-record-table";

interface DNSRecordsSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
}

export const DNSRecordsSection = ({
	domain,
	isLoading,
	onCopyToClipboard,
	copiedItems = new Set(),
}: DNSRecordsSectionProps) => {
	const { dkimRecords, sendingRecords, dmarcRecords } = groupDomainDnsRecords(
		domain?.dnsRecords,
	);

	return (
		<div className="mb-24">
			<DNSRecordSectionGroup
				title="Domain verification (DKIM)"
				docsUrl="https://reloop.sh/docs/dns/dkim"
				records={dkimRecords}
				isLoading={!!isLoading}
				onCopyToClipboard={onCopyToClipboard}
				copiedItems={copiedItems}
				tableId="dkim-"
			/>

			<DNSRecordSectionGroup
				title="Sending Email (SPF)"
				docsUrl="https://reloop.sh/docs/dns/spf"
				records={sendingRecords}
				isLoading={!!isLoading}
				onCopyToClipboard={onCopyToClipboard}
				copiedItems={copiedItems}
				tableId="spf-"
			/>

			<DNSRecordSectionGroup
				title="Reject spoofed emails (DMARC)"
				docsUrl="https://reloop.sh/docs/dns/dmarc"
				records={dmarcRecords}
				isLoading={!!isLoading}
				onCopyToClipboard={onCopyToClipboard}
				copiedItems={copiedItems}
				tableId="dmarc-"
			/>
		</div>
	);
};

interface DNSRecordSectionGroupProps {
	title: string;
	docsUrl: string;
	records: DNSRecord[];
	isLoading: boolean;
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
	tableId: string;
}

const DNSRecordSectionGroup = ({
	title,
	docsUrl,
	records,
	isLoading,
	onCopyToClipboard,
	copiedItems,
	tableId,
}: DNSRecordSectionGroupProps) => {
	return (
		<div className="mb-10 last:mb-0">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div className="space-y-1">
					<Link
						href={docsUrl}
						target="_blank"
						className="group flex items-center gap-1 hover:underline"
					>
						<span className="font-medium text-sm text-text-strong-950">
							{title}
						</span>
						<Icon
							name="arrow-top-right"
							className="h-2.5 w-2.5 text-text-sub-600 opacity-0 group-hover:opacity-100"
						/>
					</Link>
				</div>
			</div>
			<DNSRecordTable
				records={records}
				onCopyToClipboard={onCopyToClipboard}
				copiedItems={copiedItems}
				isLoading={isLoading}
				loadingRows={records.length || 1}
				tableId={tableId}
			/>
		</div>
	);
};
