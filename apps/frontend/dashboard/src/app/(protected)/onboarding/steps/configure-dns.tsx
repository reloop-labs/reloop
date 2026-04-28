"use client";

import type { DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { DNSAutoConnectBanner } from "@fe/dashboard/app/(protected)/(layout)/domain/[domainId]/components/dns-auto-connect-banner";
import { DNSRecordSection } from "./configure-dns/components/dns-record-section";
import { DomainAddedAlert } from "./configure-dns/components/domain-added-alert";
import { groupDomainDnsRecords } from "./configure-dns/utils/dns-record-groups";

export const ConfigureDnsStep = () => {
	const [domainId] = useQueryState("domainId", parseAsString.withDefault(""));
	const [, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [isVerifying, setIsVerifying] = React.useState(false);

	const { data: domainData, isLoading } = useSWR<DomainResponse>(
		domainId ? `/api/domain/v1/${domainId}` : null,
	);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {}
	};

	const handleVerifyDNS = async () => {
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
			setStep(4);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	useHotkeys(
		"mod+enter",
		() => {
			if (!isVerifying) {
				handleVerifyDNS();
			}
		},
		{ enableOnFormTags: true },
	);

	useHotkeys("v+l", () => {
		setStep(4);
	});

	const { sendingRecords, dkimRecords, dmarcRecords } = groupDomainDnsRecords(
		domainData?.dnsRecords,
	);

	if (!domainId && !isLoading) {
		return (
			<div className="fade-in animate-in duration-500">
				<p className="text-text-sub-600 outline-none">
					Please add a domain in the previous step.
				</p>
			</div>
		);
	}

	return (
		<div className="fade-in animate-in pb-10 duration-500">
			<div className="relative mx-auto mb-8">
				<DomainAddedAlert domainName={domainData?.domain} />

				<DNSAutoConnectBanner domain={domainData} domainId={domainId} />

				{dkimRecords.length > 0 && (
					<DNSRecordSection
						title="Domain verification (DKIM)"
						records={dkimRecords}
						onCopyToClipboard={copyToClipboard}
						isLoading={isLoading}
						docsUrl="https://reloop.sh/docs/dns/dkim"
					/>
				)}

				<DNSRecordSection
					title="Sending Email (SPF)"
					records={sendingRecords}
					onCopyToClipboard={copyToClipboard}
					isLoading={isLoading}
					docsUrl="https://reloop.sh/docs/dns/spf"
				/>

				{dmarcRecords.length > 0 && (
					<DNSRecordSection
						loadingRows={2}
						title="Reject spoofed emails (DMARC)"
						records={dmarcRecords}
						onCopyToClipboard={copyToClipboard}
						isLoading={isLoading}
						docsUrl="https://reloop.sh/docs/dns/dmarc"
					/>
				)}

				<div className="mt-8 flex items-center gap-3">
					<Button.Root
						onClick={handleVerifyDNS}
						size="xsmall"
						variant="neutral"
						disabled={isVerifying}
					>
						{isVerifying ? (
							<>
								<Spinner color="currentColor" />
								Verifying...
							</>
						) : (
							<>
								Verify DNS Records
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
							</>
						)}
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => setStep(4)}
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
