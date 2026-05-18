"use client";
import type { DomainResponse } from "@fe/dashboard/types/api.types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { DNSAutoConnectBanner } from "../../[domainId]/components/dns-auto-connect-banner";
import { groupDomainDnsRecords } from "../../[domainId]/components/dns-record-groups";
import { DomainNotFound } from "../../components/domain-not-found";
import { DNSRecordSection } from "./components/dns-record-section";

const NewDomainPage = () => {
	const [isVerifying, setIsVerifying] = React.useState(false);
	const { domainId } = useParams();
	const router = useRouter();

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		`/api/domain/v1/${domainId}`,
	);

	useHotkeys("esc", () => {
		router.push("/domain");
	});

	useHotkeys("mod+enter", (e) => {
		e.preventDefault();
		handleVerifyAndNavigate();
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

	const { sendingRecords, receivingRecords, dkimRecords, dmarcRecords, trackingRecords } = groupDomainDnsRecords(
		domainData?.dnsRecords,
	);

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
			<div className="flex w-full items-center justify-between pt-6 pb-6">
				<div>
					<h1 className="flex items-center gap-2 font-semibold text-title-h5 leading-8">
						{domainData?.domain || <Skeleton className="h-6 w-48" />}
						<Icon name="check-circle" className="size-5 text-warning-base" />
					</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Successfully added and ready for DNS configuration
					</p>
				</div>
			</div>

			<div className="relative mb-10 space-y-9">
				<DNSAutoConnectBanner domain={domainData} />
				
				{/* Domain Verification Group */}
				<div className="space-y-4">
					<h3 className="font-semibold text-lg text-text-strong-950">Domain Verification</h3>
					{dkimRecords.length > 0 && (
						<DNSRecordSection
							title="DKIM"
							records={dkimRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							docsUrl="https://reloop.sh/docs/dns/dkim"
						/>
					)}
				</div>

				{/* Enable Sending Group */}
				<div className="space-y-4 pt-4 border-t border-stroke-soft-100 dark:border-stroke-soft-100/10">
					<h3 className="font-semibold text-lg text-text-strong-950">Enable Sending</h3>
					<div className="space-y-6">
						<DNSRecordSection
							title="SPF"
							records={sendingRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							docsUrl="https://reloop.sh/docs/dns/spf"
						/>
						{dmarcRecords.length > 0 && (
							<DNSRecordSection
								loadingRows={2}
								title="DMARC (Optional)"
								records={dmarcRecords}
								onCopyToClipboard={copyToClipboard}
								isLoading={isLoading}
								docsUrl="https://reloop.sh/docs/dns/dmarc"
							/>
						)}
					</div>
				</div>

				{/* Enable Receiving Group */}
				{receivingRecords.length > 0 && (
					<div className="space-y-4 pt-4 border-t border-stroke-soft-100 dark:border-stroke-soft-100/10">
						<h3 className="font-semibold text-lg text-text-strong-950">Enable Receiving</h3>
						<DNSRecordSection
							title="MX"
							records={receivingRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							docsUrl="https://reloop.sh/docs/dns/mx"
						/>
					</div>
				)}

				{/* Tracking Group */}
				{trackingRecords.length > 0 && (
					<div className="space-y-4 pt-4 border-t border-stroke-soft-100 dark:border-stroke-soft-100/10">
						<h3 className="font-semibold text-lg text-text-strong-950">Tracking</h3>
						<DNSRecordSection
							title="CNAME"
							records={trackingRecords}
							onCopyToClipboard={copyToClipboard}
							isLoading={isLoading}
							docsUrl="https://reloop.sh/docs/dns/cname"
						/>
					</div>
				)}
				<div className="flex items-center gap-3 pt-10">
					<Button.Root
						onClick={handleVerifyAndNavigate}
						size="xsmall"
						variant="neutral"
						disabled={isVerifying}
					>
						{isVerifying ? "Verifying..." : "Verify DNS Records"}
						<span className="flex items-center gap-0.5">
							<KbdCommand />
							<KbdEnter />
						</span>
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => router.push("/domain")}
						className="gap-1.5"
					>
						Verify later
						<KbdEsc />
					</Button.Root>
				</div>
			</div>
		</div>
	);
};

export default NewDomainPage;
