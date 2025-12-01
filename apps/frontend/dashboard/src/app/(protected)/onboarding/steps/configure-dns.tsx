"use client";

import type { DomainResponse } from "@reloop/api";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import useSWR from "swr";
import { DNSRecordTable } from "../../[orgSlug]/domain/[domainId]/components/DNSRecordTable";

export const ConfigureDnsStep = () => {
	const [domain] = useQueryState("domain", parseAsString.withDefault(""));
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		domain ? `/api/domain/v1/${domain}` : null,
	);

	const copyToClipboard = async (text: string, itemId: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedItems((prev) => new Set(prev).add(itemId));
			setTimeout(() => {
				setCopiedItems((prev) => {
					const newSet = new Set(prev);
					newSet.delete(itemId);
					return newSet;
				});
			}, 2000);
		} catch {
			// Handle copy error silently
		}
	};

	// Separate DMARC records from DKIM/SPF records
	const dmarcRecords = domainData?.dnsRecords.filter(
		(record) =>
			record.name.includes("_dmarc") ||
			(record.recordType === "TXT" && record.value.includes("v=DMARC")),
	);
	const otherRecords = domainData?.dnsRecords.filter(
		(record) =>
			!record.name.includes("_dmarc") &&
			!(record.recordType === "TXT" && record.value.includes("v=DMARC")),
	);

	if (!domain) {
		return (
			<div className="fade-in animate-in duration-500">
				<p className="text-text-sub-600">
					Please add a domain in the previous step.
				</p>
			</div>
		);
	}

	if (
		(!domainData ||
			!domainData.dnsRecords ||
			domainData.dnsRecords.length === 0) &&
		!isLoading
	) {
		return (
			<div className="fade-in animate-in duration-500">
				<p className="text-text-sub-600">
					No DNS records found for this domain. Please try again.
				</p>
			</div>
		);
	}

	return (
		<div className="fade-in animate-in duration-500">
			{/* DKIM and SPF Records */}
			<div className="relative mb-10">
				<div className="mb-6 space-y-1">
					<div className="font-medium text-base text-text-strong-950">
						DKIM and SPF <span className="text-text-sub-600">(Required)</span>
					</div>
					<div className="text-sm text-text-sub-600">
						Enable email signing and specify authorized senders.
					</div>
				</div>
				<div className="w-full">
					<DNSRecordTable
						records={otherRecords}
						onCopyToClipboard={copyToClipboard}
						copiedItems={copiedItems}
						isLoading={isLoading}
						loadingRows={1}
						tableId="dkim-"
						hideStatus={true}
						showPriorityColumn={true}
						nameColumnWidth="minmax(100px,auto)"
					/>
				</div>
			</div>

			{/* DMARC Records */}
			<div className="relative">
				<div className="mb-6 space-y-1">
					<div className="font-medium text-base text-text-strong-950">
						DMARC <span className="text-text-sub-600">(Recommended)</span>
					</div>
					<div className="text-sm text-text-sub-600">
						Set authentication policies and receive reports.
					</div>
				</div>
				<div className="w-full">
					<DNSRecordTable
						records={dmarcRecords}
						onCopyToClipboard={copyToClipboard}
						copiedItems={copiedItems}
						isLoading={isLoading}
						loadingRows={1}
						tableId="dmarc-"
						hideStatus={true}
						showPriorityColumn={false}
						nameColumnWidth="minmax(100px,auto)"
					/>
				</div>
			</div>
		</div>
	);
};
