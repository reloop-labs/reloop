"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { DomainResponse } from "@reloop/api";
import * as Alert from "@reloop/ui/alert";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { DNSRecordTable } from "../../[domainId]/components/DNSRecordTable";
import Spinner from "@reloop/ui/spinner";

const NewDomainPage = () => {
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
	const [isVerifying, setIsVerifying] = React.useState(false);
	const { push } = useUserOrganization();
	const { domainId } = useParams();
	const { back } = useRouter();

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		domainId ? `/api/domain/v1/${domainId}` : null,
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

	const handleVerifyAndNavigate = async () => {
		if (!domainData?.domain) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			// Trigger Inngest workflow for background verification
			await axios.post(
				"/api/domain/v1/verify",
				{ domain: domainData.domain },
				{ headers: { credentials: "include" } },
			);

			// Refresh domain data to get "verifying" status
			await mutate(`/api/domain/v1/${domainId}`);

			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);

			// Navigate to domain detail page to see verification progress
			push(`/domain`);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
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
				<Button.Root
					onClick={() => back()}
					variant="neutral"
					mode="stroke"
					size="xxsmall"
				>
					<Button.Icon>
						<Icon name="chevron-left" className="h-4 w-4" />
					</Button.Icon>
					Back
				</Button.Root>
				<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
					<div>
						<h1 className="font-medium text-title-h5 leading-8">Add Domain</h1>
						<p className="text-paragraph-sm text-text-sub-600">
							You need a domain to send emails from your own domain
						</p>
					</div>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() =>
							window.open("https://reloop.sh/docs/domain", "_blank")
						}
					>
						<Icon name="file-text" className="h-4 w-4" />
						Go to docs
					</Button.Root>
				</div>
				<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
					<p className="text-yellow-800">
						No DNS records found for this domain. Please generate DNS records
						first.
					</p>
				</div>
			</div>
		);
	}

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

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
			<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
				<div>
					<h1 className="font-medium text-title-h5 leading-8">Domain Added</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						You have successfully added the domain
					</p>
				</div>
				<Button.Root
					onClick={handleVerifyAndNavigate}
					size="xsmall"
					variant="neutral"
					disabled={isVerifying}
				>
					{isVerifying ? (
						<>
							<Button.Icon>
								<Spinner size={16} color="currentColor" />
							</Button.Icon>
							Verifying
						</>
					) : (
						"I have added the DNS records"
					)}
				</Button.Root>

			</div>

			<div className="relative my-10">
				<Alert.Root
					variant="stroke"
					status="success"
					size="small"
					className="w-full border-[1px] border-success-base bg-success-base/5 rounded-xl"
				>
					<div className="flex gap-2">
						<Icon
							name="checkbox-circle"
							className="mt-2 size-4 text-success-base"
						/>
						<div>
							<div className="font-medium text-label-md">{domainId}</div>
							<div className="text-xs text-text-sub-600">New added domain</div>
						</div>
					</div>
				</Alert.Root>

				{/* DKIM and SPF Records */}
				<div className="relative mt-10">
					<div className="mb-6 space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							DKIM and SPF <span className="text-text-sub-600 text-xs">(Required)</span>
						</div>
						<div className="text-xs text-text-sub-600">
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
						/>
					</div>
				</div>

				<div className="relative mt-10">
					<div className="mb-6 space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							DMARC <span className="text-text-sub-600 text-xs">(Recommended)</span>
						</div>
						<div className="text-xs text-text-sub-600">
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
						/>
					</div>
				</div>

				<Button.Root
					onClick={handleVerifyAndNavigate}
					size="xsmall"
					variant="neutral"
					className="mt-5"
					disabled={isVerifying}
				>
					{isVerifying ? (
						<>
							<Button.Icon>
								<Spinner size={16} color="currentColor" />
							</Button.Icon>
							Verifying
						</>
					) : (
						"I have added the DNS records"
					)}
				</Button.Root>
			</div>
		</div>
	);
};

export default NewDomainPage;
