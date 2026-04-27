"use client";

import type { DomainResponse } from "@reloop/api";
import type { DNSRecord } from "@reloop/api/types";
import { Icon } from "@reloop/ui/icon";
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
	const { dkimRecords, sendingRecords, dmarcRecords } = groupDomainDnsRecords(
		domain?.dnsRecords,
	);

	return (
		<div className="mt-6 mb-24 space-y-5">
			<DNSAutoConnectBanner domain={domain} />
			<div>
				<DNSRecordSectionGroup
					title="Domain verification (DKIM)"
					docsUrl="https://reloop.sh/docs/dns/dkim"
					records={dkimRecords}
					isLoading={!!isLoading}
					tableId="dkim-"
				/>

				<DNSRecordSectionGroup
					title="Sending Email (SPF)"
					docsUrl="https://reloop.sh/docs/dns/spf"
					records={sendingRecords}
					isLoading={!!isLoading}
					tableId="spf-"
				/>

				<DNSRecordSectionGroup
					title="Reject spoofed emails (DMARC)"
					docsUrl="https://reloop.sh/docs/dns/dmarc"
					records={dmarcRecords}
					isLoading={!!isLoading}
					tableId="dmarc-"
				/>
			</div>
		</div>
	);
};

interface DNSRecordSectionGroupProps {
	title: string;
	docsUrl: string;
	records: DNSRecord[];
	isLoading: boolean;
	tableId: string;
}

const DNSRecordSectionGroup = ({
	title,
	docsUrl,
	records,
	isLoading,
	tableId,
}: DNSRecordSectionGroupProps) => {
	return (
		<div className="mb-7 last:mb-0">
			<div className="mb-4 flex items-start justify-between gap-4">
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
