import * as Button from "@reloop/ui/button";
import { Skeleton } from "@reloop/ui/skeleton";
import * as Switch from "@reloop/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DomainNotFound } from "../../components/domain-not-found";
import { DNSAutoConnectBanner } from "../../detail/components/dns-auto-connect-banner";
import { groupDomainDnsRecords } from "../../detail/components/dns-record-groups";
import { useDomainActions } from "../../detail/hooks/use-domain-actions";
import {
	useDomainDetailQuery,
	useInvalidateDomains,
} from "../../hooks/use-domains-query";
import { DNSRecordSection } from "./components/dns-record-section";
import { ForwardDNSRecordsButton } from "./components/forward-dns-records";

export function DomainSetupPage({ domainId }: { domainId: string }) {
	const [isVerifying, setIsVerifying] = React.useState(false);
	const navigate = useNavigate();
	const invalidate = useInvalidateDomains();
	const { hasInitialized, isPending: orgPending } = useActiveOrganization();
	const canFetch = Boolean(domainId && hasInitialized && !orgPending);

	const { data: domainData, isPending, isFetching } = useDomainDetailQuery(
		domainId,
		canFetch,
	);
	const showLoading = !canFetch || isPending || (isFetching && !domainData);

	const { handleUpdateDomain } = useDomainActions(domainId, domainData);

	useHotkeys("esc", () => {
		void navigate({ to: "/domain" });
	});

	useHotkeys("mod+enter", (e) => {
		e.preventDefault();
		void handleVerifyAndNavigate();
	});

	const handleVerifyAndNavigate = async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}
		setIsVerifying(true);
		try {
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				withCredentials: true,
			});
			await invalidate();
			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
			void navigate({ to: "/domain" });
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(message);
		} finally {
			setIsVerifying(false);
		}
	};

	if (
		(!domainData ||
			!domainData.dnsRecords ||
			domainData.dnsRecords.length === 0) &&
		!showLoading
	) {
		return (
			<div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-3xl flex-col items-center justify-center sm:px-8">
				<DomainNotFound />
			</div>
		);
	}

	const groups = domainData
		? groupDomainDnsRecords(domainData.dnsRecords)
		: null;

	return (
		<div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
			<div className="flex items-start justify-between gap-4 pt-6">
				<div>
					{showLoading ? (
						<>
							<Skeleton className="h-7 w-48" />
							<Skeleton className="mt-2 h-4 w-64" />
						</>
					) : (
						<>
							<h1 className="font-semibold text-title-h6 leading-8">
								Configure DNS for {domainData?.domain}
							</h1>
							<p className="mt-1 text-paragraph-sm text-text-sub-600">
								Add these records at your DNS provider, then verify.
							</p>
						</>
					)}
				</div>
			</div>

			{!showLoading && domainData && (
				<div className="flex items-center gap-4 rounded-xl border border-stroke-soft-100 px-4 py-3 dark:border-stroke-soft-100/40">
					<div className="flex flex-1 items-center justify-between gap-3">
						<div>
							<p className="font-medium text-sm text-text-strong-950">
								Click tracking
							</p>
							<p className="text-paragraph-xs text-text-sub-600">
								Track link clicks in your emails
							</p>
						</div>
						<Switch.Root
							checked={domainData.isClickTrackingEnabled}
							onCheckedChange={(v) =>
								void handleUpdateDomain(
									{ isClickTrackingEnabled: v },
									v ? "Click tracking enabled" : "Click tracking disabled",
								)
							}
						/>
					</div>
					<div className="flex flex-1 items-center justify-between gap-3">
						<div>
							<p className="font-medium text-sm text-text-strong-950">
								Open tracking
							</p>
							<p className="text-paragraph-xs text-text-sub-600">
								Track when emails are opened
							</p>
						</div>
						<Switch.Root
							checked={domainData.isOpenTrackingEnabled}
							onCheckedChange={(v) =>
								void handleUpdateDomain(
									{ isOpenTrackingEnabled: v },
									v ? "Open tracking enabled" : "Open tracking disabled",
								)
							}
						/>
					</div>
				</div>
			)}

			<DNSAutoConnectBanner domain={domainData} domainId={domainId} />

			{showLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-40 w-full rounded-xl" />
				</div>
			) : (
				groups && (
					<div className="space-y-6">
						{(groups.sendingRecords.length > 0 ||
							groups.dkimRecords.length > 0 ||
							groups.dmarcRecords.length > 0) && (
							<DNSRecordSection
								title="Sending records"
								records={[
									...groups.sendingRecords,
									...groups.dkimRecords,
									...groups.dmarcRecords,
								]}
								isLoading={false}
								docsUrl="https://reloop.sh/docs/domains"
							/>
						)}
						{groups.receivingRecords.length > 0 && (
							<DNSRecordSection
								title="Receiving records"
								records={groups.receivingRecords}
								isLoading={false}
							/>
						)}
						{groups.trackingRecords.length > 0 && (
							<DNSRecordSection
								title="Tracking records"
								records={groups.trackingRecords}
								isLoading={false}
							/>
						)}
					</div>
				)
			)}

			<div className="flex items-center justify-between gap-3 border-stroke-soft-100 border-t pt-6 dark:border-stroke-soft-100/40">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => void navigate({ to: "/domain" })}
				>
					Cancel
				</Button.Root>
				<div className="flex items-center gap-2">
					{domainData && <ForwardDNSRecordsButton domainId={domainData.id} />}
					<Button.Root
						variant="neutral"
						size="small"
						onClick={() => void handleVerifyAndNavigate()}
						disabled={isVerifying || showLoading}
					>
						{isVerifying ? "Verifying…" : "Verify & finish"}
					</Button.Root>
				</div>
			</div>
		</div>
	);
}
