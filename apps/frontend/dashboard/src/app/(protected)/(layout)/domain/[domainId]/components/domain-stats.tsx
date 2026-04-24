import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { DomainResponse } from "@reloop/api";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import type * as React from "react";
import { formatStatusLabel, getStatusBadgeStyles } from "../utils";
import { DNSProviderInfo } from "./dns-provider-info";

interface DomainStatsProps {
	domain?: DomainResponse;
	nameservers?: string[] | null;
	isLoading: boolean;
	isLoadingNameservers: boolean;
}

export const DomainStats: React.FC<DomainStatsProps> = ({
	domain,
	nameservers,
	isLoading,
	isLoadingNameservers,
}) => {
	return (
		<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
			{/* Created */}
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center gap-1.5">
					<Icon name="calendar" className="h-3.5 w-3.5 text-text-sub-600" />
					<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
						Created
					</span>
				</div>
				{isLoading ? (
					<Skeleton className="h-5 w-24 rounded-lg" />
				) : (
					<span className="font-medium text-paragraph-sm text-text-strong-950">
						{domain?.createdAt ? formatRelativeTime(domain.createdAt) : "---"}
					</span>
				)}
			</div>

			{/* Status */}
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center gap-1.5">
					<Icon name="activity" className="h-3.5 w-3.5 text-text-sub-600" />
					<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
						Status
					</span>
				</div>
				{isLoading ? (
					<Skeleton className="h-5 w-20 rounded-lg" />
				) : (
					<span
						className={cn(
							"inline-flex w-fit rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
							getStatusBadgeStyles(domain?.status || "start-verify"),
						)}
					>
						{formatStatusLabel(domain?.status || "start-verify")}
					</span>
				)}
			</div>

			{/* Provider */}
			<DNSProviderInfo
				nameservers={nameservers || domain?.nameservers}
				isLoading={isLoading || isLoadingNameservers}
			/>
		</div>
	);
};
