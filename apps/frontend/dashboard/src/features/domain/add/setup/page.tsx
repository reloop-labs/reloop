import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { DomainNotFound } from "../../components/domain-not-found";
import { DNSAutoConnectBanner } from "../../detail/components/dns-auto-connect-banner";
import { DNSRecordsSection } from "../../detail/components/dns-records-section";
import {
	useDomainDetailQuery,
	useInvalidateDomains,
} from "../../hooks/use-domains-query";
import { ForwardDNSRecordsButton } from "./components/forward-dns-records";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

function BackspaceIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 -0.5 25 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className || "size-3.5"}
			aria-hidden
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5.91006 12.6651L8.35606 15.5261C8.59533 15.82 8.95209 15.9935 9.33106 16.0001L13.0501 15.9931H16.2391C18.0288 16.0036 19.4885 14.5618 19.5001 12.7721V10.2221C19.4891 8.43193 18.0292 6.98953 16.2391 7.00006L9.33106 7.00706C8.95226 7.01341 8.59552 7.18647 8.35606 7.48006L5.91006 10.3421C5.36331 11.0199 5.36331 11.9872 5.91006 12.6651V12.6651Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M12.1603 9.46359C11.864 9.17409 11.3892 9.17957 11.0997 9.47582C10.8102 9.77207 10.8156 10.2469 11.1119 10.5364L12.1603 9.46359ZM12.6469 12.0364C12.9431 12.3259 13.418 12.3204 13.7075 12.0242C13.997 11.7279 13.9915 11.2531 13.6953 10.9636L12.6469 12.0364ZM13.6963 10.9646C13.4006 10.6745 12.9258 10.6791 12.6357 10.9748C12.3456 11.2705 12.3502 11.7453 12.6458 12.0354L13.6963 10.9646ZM14.1748 13.5354C14.4705 13.8255 14.9454 13.8209 15.2355 13.5252C15.5255 13.2295 15.521 12.7547 15.2253 12.4646L14.1748 13.5354ZM13.6953 12.0364C13.9915 11.7469 13.997 11.2721 13.7075 10.9758C13.418 10.6796 12.9431 10.6741 12.6469 10.9636L13.6953 12.0364ZM11.1119 12.4636C10.8156 12.7531 10.8102 13.2279 11.0997 13.5242C11.3892 13.8204 11.864 13.8259 12.1603 13.5364L11.1119 12.4636ZM12.6458 10.9646C12.3502 11.2547 12.3456 11.7295 12.6357 12.0252C12.9258 12.3209 13.4006 12.3255 13.6963 12.0354L12.6458 10.9646ZM15.2253 10.5354C15.521 10.2453 15.5255 9.77046 15.2355 9.47477C14.9454 9.17909 14.4705 9.17454 14.1748 9.46462L15.2253 10.5354ZM11.1119 10.5364L12.6469 12.0364L13.6963 10.9636L12.1603 9.46359L11.1119 10.5364ZM12.6458 12.0354L14.1748 13.5354L15.2253 12.4646L13.6963 10.9646L12.6458 10.9646ZM12.6469 10.9636L11.1119 12.4636L12.1603 13.5364L13.6953 12.0364L12.6469 10.9636ZM13.6963 12.0354L15.2253 10.5354L14.1748 9.46462L12.6458 10.9646L13.6963 12.0354Z"
				fill="currentColor"
			/>
		</svg>
	);
}

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

	useHotkeys(
		"mod+backspace",
		(e) => {
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			) {
				return;
			}
			e.preventDefault();
			router.push("/domain");
		},
		{ enableOnFormTags: true, preventDefault: true },
	);

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			void handleVerifyAndNavigate();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

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
			<div className="pt-6">
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
					className="mt-0 mb-0"
					showAutoConnectBanner={false}
				/>
			)}

			<div className="flex items-center justify-between gap-3 pt-6">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => router.push("/domain")}
					className="gap-1.5 rounded-xl"
				>
					Close
					<span className="inline-flex items-center gap-0.5">
						<ActionKbd className="w-auto min-w-0 px-1">⌘</ActionKbd>
						<ActionKbd className="w-auto min-w-4 px-1">
							<BackspaceIcon className="size-3.5" />
						</ActionKbd>
					</span>
				</Button.Root>
				<div className="flex items-center gap-3">
					{domainData ? (
						<ForwardDNSRecordsButton domainId={domainData.id} />
					) : null}
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
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</div>
		</div>
	);
}
