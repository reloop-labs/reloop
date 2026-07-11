import { AnimatedClock } from "@fe/dashboard/components/animated-clock";
import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { getStatusColorClass, getStatusIcon } from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import type * as React from "react";
import { DNSProviderInfo } from "./dns-provider-info";

interface DomainStatsProps {
	domain?: DomainResponse;
	isLoading: boolean;
}

export const DomainStats: React.FC<DomainStatsProps> = ({
	domain,
	isLoading,
}) => {
	return (
		<div className="mt-7 grid grid-cols-3 gap-x-12 gap-y-6">
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
					<div
						className={cn(
							"flex items-center gap-1",
							getStatusColorClass(domain?.status || "pending"),
						)}
					>
						{(domain?.status || "pending") === "verifying" ? (
							<AnimatedClock className="h-3.5 w-3.5" />
						) : (
							<Icon
								name={getStatusIcon(domain?.status || "pending")}
								className="h-3.5 w-3.5"
							/>
						)}
						<p className="font-medium text-paragraph-xs capitalize">
							{domain?.status || "pending"}
						</p>
					</div>
				)}
			</div>

			<DNSProviderInfo isLoading={isLoading} />
		</div>
	);
};
