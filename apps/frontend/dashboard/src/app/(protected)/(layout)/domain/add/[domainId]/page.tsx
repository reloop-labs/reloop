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

const NewDomainPage = () => {
	const [isVerifying, setIsVerifying] = React.useState(false);
	const { domainId } = useParams();
	const router = useRouter();

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		`/api/domain/v1/${domainId}`,
	);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {}
	};

	const handleVerifyAndNavigate = async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				headers: { credentials: "include" },
			});
			await mutate(`/api/domain/v1/${domainId}`);
			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
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

	if (
		(!domainData ||
			!domainData.dnsRecords ||
			domainData.dnsRecords.length === 0) &&
		!isLoading
	) {
		return (
			<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
				<NewDomainEmptyState />
			</div>
		);
	}

	const { sendingRecords, dmarcRecords } = groupDomainDnsRecords(
		domainData?.dnsRecords,
	);

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
			<div className="flex w-full items-center justify-between pt-6 pb-6">
				<div>
					<h1 className="font-medium text-title-h5 leading-8">Domain Added</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						You have successfully added the domain
					</p>
				</div>
			</div>

			<div className="relative mb-10">
				<DomainAddedAlert domainName={domainData?.domain} />
				<DNSRecordSection
					title="Sending Email"
					records={sendingRecords}
					onCopyToClipboard={copyToClipboard}
					isLoading={isLoading}
					tableId="dkim-"
				/>

				<DNSRecordSection
					title="DMARC"
					records={dmarcRecords}
					onCopyToClipboard={copyToClipboard}
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
