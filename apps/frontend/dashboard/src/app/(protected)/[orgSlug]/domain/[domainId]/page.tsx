"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/somthing-went-wrong";
import type { DomainResponse } from "@reloop/api";
import { useParams } from "next/navigation";
import * as React from "react";
import useSWR, { mutate } from "swr";
import { DNSRecordsSection } from "./components/DNSRecordsSection";
import { DomainHeader } from "./components/DomainHeader";
import { StatusBanner } from "./components/StatusBanner";

const DomainPage = () => {
	const { domainId } = useParams();
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());

	const {
		data: domainData,
		error,
		isLoading,
	} = useSWR<DomainResponse>(domainId ? `/api/domain/v1/${domainId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

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
		} catch (err) {
			// Handle copy error silently
		}
	};

	const dkimSpfRecords =
		domainData?.dnsRecords?.filter(
			(record) => record.recordType === "MX" || record.recordType === "TXT",
		) || [];

	const dmarcRecords =
		domainData?.dnsRecords?.filter((record) =>
			record.name.includes("_dmarc"),
		) || [];

	if (error) {
		return (
			<div className="mx-auto max-w-3xl">
				<DomainHeader domainId={domainId as string} status="failed" isFailed />
				<div className="pt-20">
					<SomethingWentWrong
						errorType="server"
						title="Failed to Load Domain Information"
						description="We couldn't load the domain information. This might be due to a temporary server issue or network problem."
						onRetry={() => mutate(`/api/domain/v1/${domainId}`)}
						refreshText="Reload Page"
						onRefresh={() => window.location.reload()}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl">
			<DomainHeader
				domainId={domainData?.domain || (domainId as string)}
				status={domainData?.status || "start-verify"}
				isLoading={isLoading}
				lastUpdated={domainData?.createdAt || undefined}
			/>
			<StatusBanner
				status={domainData?.status || "start-verify"}
				isLoading={isLoading}
			/>
			<div className="my-9">
				<div className="w-full border-stroke-soft-200 border-t border-dashed" />
			</div>
			<DNSRecordsSection
				dkimSpfRecords={dkimSpfRecords}
				dmarcRecords={dmarcRecords}
				onCopyToClipboard={copyToClipboard}
				copiedItems={copiedItems}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default DomainPage;
