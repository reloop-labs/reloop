"use client";
import type { DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { groupDomainDnsRecords } from "../../[domainId]/components/dns-record-groups";
import { DNSRecordSection } from "./components/DNSRecordSection";
import { DomainAddedAlert } from "./components/DomainAddedAlert";
import { NewDomainEmptyState } from "./components/NewDomainEmptyState";
import { NewDomainHeader } from "./components/NewDomainHeader";

const NewDomainPage = () => {
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const [isVerifying, setIsVerifying] = React.useState(false);
	const [isUpdatingSending, setIsUpdatingSending] = React.useState(false);
	const [isUpdatingReceiving, setIsUpdatingReceiving] = React.useState(false);
	const { domainId } = useParams();
	const router = useRouter();

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		`/api/domain/v1/${domainId}`,
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
		} catch {}
	};

	const handleVerifyAndNavigate = async () => {
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

			// Navigate to domain list page
			router.push("/domain");
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	const handleUpdateDomain = async (
		payload: Partial<Pick<DomainResponse, "sendingEmail" | "receivingEmail">>,
		setUpdating: React.Dispatch<React.SetStateAction<boolean>>,
	) => {
		if (!domainId || !domainData) {
			toast.error("Domain information not available");
			return;
		}

		const cacheKey = `/api/domain/v1/${domainId}`;
		setUpdating(true);
		await mutate(cacheKey, { ...domainData, ...payload }, false);

		try {
			const { data } = await axios.patch<DomainResponse>(
				`/api/domain/v1/${domainId}`,
				payload,
				{ headers: { credentials: "include" } },
			);
			await mutate(cacheKey, data, false);
		} catch (error) {
			await mutate(cacheKey);
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to update domain"
				: "Failed to update domain";
			toast.error(errorMessage);
		} finally {
			setUpdating(false);
		}
	};

	if (
		(!domainData ||
			!domainData.dnsRecords ||
			domainData.dnsRecords.length === 0) &&
		!isLoading
	) {
		return (
			<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
				<NewDomainEmptyState onBack={() => router.back()} />
			</div>
		);
	}

	const { sendingRecords, receivingRecords, dmarcRecords } =
		groupDomainDnsRecords(domainData?.dnsRecords);

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
			<NewDomainHeader
				title="Domain Added"
				description="You have successfully added the domain"
				action={{
					label: "I have added the DNS records",
					onClick: handleVerifyAndNavigate,
					isLoading: isVerifying,
				}}
			/>

			<div className="relative my-10">
				<DomainAddedAlert
					domainName={domainData?.domain || (domainId as string)}
				/>

				<DNSRecordSection
					title="Sending Email"
					statusText="Required"
					description="Enable email signing and specify authorized senders."
					records={sendingRecords}
					onCopyToClipboard={copyToClipboard}
					copiedItems={copiedItems}
					isLoading={isLoading}
					tableId="dkim-"
					switchProps={{
						checked: domainData?.sendingEmail ?? true,
						onCheckedChange: (value) =>
							handleUpdateDomain({ sendingEmail: value }, setIsUpdatingSending),
						disabled: isLoading || isUpdatingSending,
					}}
				/>

				{receivingRecords.length > 0 && (
					<DNSRecordSection
						title="Receiving Email"
						statusText="Optional"
						description="Route inbound mail to your receiving mail host."
						records={receivingRecords}
						onCopyToClipboard={copyToClipboard}
						copiedItems={copiedItems}
						isLoading={isLoading}
						tableId="receiving-"
						switchProps={{
							checked: domainData?.receivingEmail ?? true,
							onCheckedChange: (value) =>
								handleUpdateDomain(
									{ receivingEmail: value },
									setIsUpdatingReceiving,
								),
							disabled: isLoading || isUpdatingReceiving,
						}}
					/>
				)}

				<DNSRecordSection
					title="DMARC"
					statusText="Recommended"
					description="Set authentication policies and receive reports."
					records={dmarcRecords}
					onCopyToClipboard={copyToClipboard}
					copiedItems={copiedItems}
					isLoading={isLoading}
					tableId="dmarc-"
				/>

				<Button.Root
					onClick={handleVerifyAndNavigate}
					size="xsmall"
					variant="neutral"
					className="mt-5"
					disabled={isVerifying}
				>
					{isVerifying ? "Verifying..." : "I have added the DNS records"}
				</Button.Root>
			</div>
		</div>
	);
};

export default NewDomainPage;
