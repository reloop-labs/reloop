import { useRouter } from "next/navigation";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
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
	const router = useRouter();
	const invalidate = useInvalidateDomains();
	const { hasInitialized, isPending: orgPending } = useActiveOrganization();
	const canFetch = Boolean(domainId && hasInitialized && !orgPending);

	const {
		data: domainData,
		isPending,
		isFetching,
	} = useDomainDetailQuery(domainId, canFetch);
	const showLoading = !canFetch || isPending || (isFetching && !domainData);

	useHotkeys("esc", () => {
		router.push("/domain");
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
			router.push("/domain");
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
				{domainData && (
					<div className="shrink-0 pt-0.5">
						<ForwardDNSRecordsButton domainId={domainData.id} />
					</div>
				)}
			</div>

			<DNSAutoConnectBanner domain={domainData} domainId={domainId} forceShow />

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

			<div className="flex items-center justify-end gap-3 pt-6">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => router.push("/domain")}
					className="rounded-xl"
				>
					Cancel
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={() => void handleVerifyAndNavigate()}
					disabled={isVerifying || showLoading}
					className={cn(
						"min-w-[134px] justify-center overflow-hidden rounded-xl transition-all duration-200",
						(isVerifying || showLoading) && "pointer-events-none opacity-90",
					)}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={isVerifying ? "verifying" : "idle"}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{
								opacity: 0,
								y: -14,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								y: 14,
							}}
							className="flex items-center justify-center gap-1.5"
						>
							{isVerifying ? (
								<>
									<Spinner size={14} color="currentColor" />
									<span>Verifying...</span>
								</>
							) : (
								<>
									<span>Verify & finish</span>
									<span className="inline-flex items-center gap-0.5">
										<Icon
											name="command"
											className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
										/>
										<Icon
											name="enter"
											className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
										/>
									</span>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}
