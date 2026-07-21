import * as Button from "@reloop/ui/button";
import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DomainNotFound } from "../../components/domain-not-found";
import { DNSAutoConnectBanner } from "../../detail/components/dns-auto-connect-banner";
import { DNSRecordsSection } from "../../detail/components/dns-records-section";
import {
	useDomainDetailQuery,
	useInvalidateDomains,
} from "../../hooks/use-domains-query";
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

			<DNSAutoConnectBanner
				domain={domainData}
				domainId={domainId}
				forceShow
			/>

			{showLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-40 w-full rounded-xl" />
				</div>
			) : (
				<DNSRecordsSection
					domain={domainData}
					isLoading={false}
					className="mb-0 mt-0"
					showAutoConnectBanner={false}
				/>
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
