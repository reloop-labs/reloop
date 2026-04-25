"use client";
import type { DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { groupDomainDnsRecords } from "../../[domainId]/components/dns-record-groups";
import { DomainNotFound } from "../../components/domain-not-found";
import { DNSRecordSection } from "./components/dns-record-section";
import { DomainAddedAlert } from "./components/domain-added-alert";

const NewDomainPage = () => {
	const [isVerifying, setIsVerifying] = React.useState(false);
	const [viewMode, setViewMode] = React.useState<"table" | "list">("table");
	const { domainId } = useParams();
	const router = useRouter();

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		`/api/domain/v1/${domainId}`,
	);

	useHotkeys(
		"mod+enter",
		() => {
			if (!isVerifying) {
				handleVerifyAndNavigate();
			}
		},
		{ enableOnFormTags: true },
	);

	useHotkeys("v+l", () => {
		router.push("/domain");
	});

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
				<DomainNotFound />
			</div>
		);
	}

	const { sendingRecords, dkimRecords, dmarcRecords } = groupDomainDnsRecords(
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

				<div className="flex items-center gap-1 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-1 dark:border-stroke-soft-100/50 dark:bg-bg-weak-50/20">
					<button
						type="button"
						onClick={() => setViewMode("table")}
						className={cn(
							"flex h-8 items-center gap-2 rounded-md px-3 font-medium text-paragraph-xs transition-all",
							viewMode === "table"
								? "bg-white text-text-strong-950 shadow-sm dark:bg-[#101010]"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						<Icon name="table" className="h-4 w-4" />
						Table
					</button>
					<button
						type="button"
						onClick={() => setViewMode("list")}
						className={cn(
							"flex h-8 items-center gap-2 rounded-md px-3 font-medium text-paragraph-xs transition-all",
							viewMode === "list"
								? "bg-white text-text-strong-950 shadow-sm dark:bg-[#101010]"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						<Icon name="list" className="h-4 w-4" />
						List
					</button>
				</div>
			</div>

			<div className="relative mb-10">
				<DomainAddedAlert domainName={domainData?.domain} />

				{dkimRecords.length > 0 && (
					<DNSRecordSection
						title="Domain verification (DKIM)"
						records={dkimRecords}
						onCopyToClipboard={copyToClipboard}
						isLoading={isLoading}
						docsUrl="https://reloop.sh/docs/dns/dkim"
						viewMode={viewMode}
					/>
				)}

				<DNSRecordSection
					title="Sending Email (SPF)"
					records={sendingRecords}
					onCopyToClipboard={copyToClipboard}
					isLoading={isLoading}
					docsUrl="https://reloop.sh/docs/dns/spf"
					viewMode={viewMode}
				/>

				{dmarcRecords.length > 0 && (
					<DNSRecordSection
						loadingRows={2}
						title="Reject spoofed emails (DMARC)"
						records={dmarcRecords}
						onCopyToClipboard={copyToClipboard}
						isLoading={isLoading}
						docsUrl="https://reloop.sh/docs/dns/dmarc"
						viewMode={viewMode}
					/>
				)}

				<div className="mt-5 flex items-center gap-3">
					<Button.Root
						onClick={handleVerifyAndNavigate}
						size="xsmall"
						variant="neutral"
						disabled={isVerifying}
					>
						{isVerifying ? "Verifying..." : "Verify DNS Records"}
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<Icon
								name="enter"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
						</span>
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => router.push("/domain")}
						className="gap-1.5"
					>
						Save & Verify later
						<span className="inline-flex items-center gap-0.5">
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
								V
							</span>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
								L
							</span>
						</span>
					</Button.Root>
				</div>
			</div>
		</div>
	);
};

export default NewDomainPage;
