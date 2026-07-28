import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";

import { useHotkeys } from "react-hotkeys-hook";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { ForwardDNSRecordsButton } from "../../add/setup/components/forward-dns-records";
import { AnimatedClock } from "../../animated-clock";
import { DeleteDomainModal } from "../../components/delete-domain";
import type { Domain } from "../../types";
import { getStatusColorClass, getStatusIcon } from "../../utils";
import { useDomainActions } from "../hooks/use-domain-actions";
import { DomainHeaderActions } from "./domain-header-actions";

export function DomainHeader({
	domain,
	domainId,
	isLoading,
}: {
	domain?: Domain;
	domainId?: string;
	isLoading?: boolean;
}) {
	const router = useRouter();
	const domainName = domain?.domain || domainId || "Domain";
	const domainRecordId = domain?.id || domainId || "";
	const status = domain?.status || "pending";
	const lastUpdated = domain?.createdAt;

	const { handleVerifyDNS, isVerifying } = useDomainActions(
		domainRecordId,
		domain as never,
	);

	useHotkeys(
		"mod+v",
		(e) => {
			e.preventDefault();
			if (status === "pending" || status === "failed") {
				void handleVerifyDNS();
			}
		},
		{ enableOnFormTags: true },
		[status, handleVerifyDNS],
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/domains", "_blank");
		},
		{ enableOnFormTags: true },
	);

	return (
		<div>
			<AnimatedBackButton onClick={() => router.push("/domain")} />
			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-12 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Domain
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								{lastUpdated ? formatRelativeTime(lastUpdated) : "---"}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div
								className={`flex items-center gap-1 ${getStatusColorClass(status)}`}
							>
								{status === "verifying" ? (
									<AnimatedClock className="h-3.5 w-3.5" />
								) : (
									<Icon name={getStatusIcon(status)} className="h-3.5 w-3.5" />
								)}
								<p className="font-medium text-paragraph-xs capitalize">
									{status}
								</p>
							</div>
						</div>
					)}
					<h1 className="font-medium text-title-h6 leading-8">{domainName}</h1>
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<Skeleton className="h-9 w-32 rounded-lg" />
					) : (
						<>
							{(status === "pending" ||
								status === "verifying" ||
								status === "failed") && (
								<>
									{domainRecordId && (
										<ForwardDNSRecordsButton domainId={domainRecordId} />
									)}
									<FancyButton.Root
										variant="blue"
										size="xsmall"
										onClick={() => void handleVerifyDNS()}
										disabled={isVerifying || status === "verifying"}
										className="font-medium"
									>
										{isVerifying || status === "verifying"
											? "Verifying..."
											: status === "failed"
												? "Try Again"
												: "Verify Domain"}
									</FancyButton.Root>
								</>
							)}
							<DomainHeaderActions
								domain={domain}
								domainRecordId={domainRecordId}
							/>
						</>
					)}
				</div>
			</div>
			{domain && <DeleteDomainModal domains={[domain]} />}
		</div>
	);
}
