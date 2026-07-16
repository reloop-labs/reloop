import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { formatRelativeTime } from "#/utils/format-relative-time";
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
	const navigate = useNavigate();
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
			<AnimatedBackButton onClick={() => void navigate({ to: "/domain" })} />
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
							{(status === "pending" || status === "failed") && (
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={() => void handleVerifyDNS()}
									disabled={isVerifying}
									className="font-medium"
								>
									{status === "failed" ? "Verify DNS Again" : "Verify Domain"}
								</Button.Root>
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
