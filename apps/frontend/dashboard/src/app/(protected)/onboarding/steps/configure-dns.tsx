"use client";

import type { DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import axios from "axios";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { toast } from "sonner";
import useSWR from "swr";
import Spinner from "@reloop/ui/spinner";
import { DNSRecordTable } from "../../[orgSlug]/domain/[domainId]/components/DNSRecordTable";

export const ConfigureDnsStep = () => {
	const [domain] = useQueryState("domain", parseAsString.withDefault(""));
	const [, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const [isVerifying, setIsVerifying] = React.useState(false);

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

	const handleVerifyDNS = async () => {
		if (!domain) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			await axios.post(
				"/api/domain/v1/verify",
				{ domain },
				{ headers: { credentials: "include" } },
			);

			toast.success(
				"DNS verification started! Verification will continue in the background.",
				{
					description:
						"You can check the verification status later in the domain settings.",
					duration: 5000,
				},
			);

			// Small delay to ensure button state is visible before navigation
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Navigate to step 4
			setStep(4);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
			setIsVerifying(false);
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
					/>
				</div>
			</div>

			{/* Verify DNS Button */}
			<div className="mt-8 flex justify-end">
				<Button.Root
					variant="neutral"
					mode="filled"
					onClick={
						domainData?.status === "verifying" ||
							domainData?.status === "active"
							? () => setStep(4)
							: handleVerifyDNS
					}
					disabled={isVerifying || !domain}
				>
					{isVerifying ? (
						<>
							<Button.Icon>
								<Spinner size={16} />
							</Button.Icon>
							Verifying DNS records...
						</>
					) : domainData?.status === "verifying" ? (
						<>
							<Button.Icon>
								<Spinner size={16} />
							</Button.Icon>
							DNS verification in progress
						</>
					) : domainData?.status === "active" ? (
						<>
							<Button.Icon>
								<Icon name="check-circle" className="h-4 w-4" />
							</Button.Icon>
							Continue to next step
						</>
					) : (
						<>
							<Button.Icon>
								<Icon name="check-circle" className="h-4 w-4" />
							</Button.Icon>
							I have added the DNS records
						</>
					)}
				</Button.Root>
			</div>
		</div>
	);
};
