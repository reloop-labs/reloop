"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import type { DomainResponse } from "@reloop/api";
import axios from "axios";
import { useParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { DNSRecordsSection } from "./components/DNSRecordsSection";
import { DomainHeader } from "./components/DomainHeader";
import { StatusBanner } from "./components/StatusBanner";
import { groupDomainDnsRecords } from "./components/dns-record-groups";

const DomainPage = () => {
	const { domainId } = useParams();
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const [isVerifying, setIsVerifying] = React.useState(false);

	const {
		data: domainData,
		error,
		isLoading,
	} = useSWR<DomainResponse>(domainId ? `/api/domain/v1/${domainId}` : null);

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

	const handleVerifyDNS = async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			// Trigger Inngest workflow for background verification
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				headers: { credentials: "include" },
			});

			// Refresh domain data to get "verifying" status
			await mutate(`/api/domain/v1/${domainId}`);

			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	const { sendingRecords, receivingRecords, dmarcRecords } =
		groupDomainDnsRecords(domainData?.dnsRecords, domainData?.customReturnPath);

	if (error) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
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
		<div className="mx-auto max-w-3xl sm:px-8">
			<DomainHeader
				domainId={domainData?.domain || (domainId as string)}
				status={domainData?.status || "start-verify"}
				isLoading={isLoading}
				lastUpdated={domainData?.createdAt || undefined}
				onVerify={handleVerifyDNS}
				isVerifying={isVerifying}
			/>
			<StatusBanner
				status={domainData?.status || "start-verify"}
				isLoading={isLoading}
			/>
			<div className="my-9">
				<div className="w-full border-stroke-soft-200 border-t border-dashed" />
			</div>
			<DNSRecordsSection
				sendingRecords={sendingRecords}
				receivingRecords={receivingRecords}
				dmarcRecords={dmarcRecords}
				onCopyToClipboard={copyToClipboard}
				copiedItems={copiedItems}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default DomainPage;
