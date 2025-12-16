"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedClock } from "@fe/dashboard/components/animated-clock";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { getStatusColorClass, getStatusIcon } from "@fe/dashboard/utils/domain";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import type { Domain, DomainStatus } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { DeleteDomainModal } from "../../components/delete-domain";
import Spinner from "@reloop/ui/spinner";

interface DomainHeaderProps {
	domainId: string;
	lastUpdated?: string;
	status?: DomainStatus;
	isLoading?: boolean;
	isFailed?: boolean;
	onVerify?: () => void | Promise<void>;
	isVerifying?: boolean;
}

const headerMenuItems = [
	{ id: "docs", label: "Go to docs", icon: "file-text" as const, isDanger: false },
	{ id: "delete", label: "Remove domain", icon: "trash" as const, isDanger: true },
];

export const DomainHeader = ({
	domainId,
	lastUpdated,
	status = "start-verify",
	isLoading,
	isFailed,
	onVerify,
	isVerifying,
}: DomainHeaderProps) => {
	const { push } = useUserOrganization();
	const [, setDeleteId] = useQueryState("delete");
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	return (
		<div className="pt-10 pb-8">
			<AnimatedBackButton onClick={() => push("/domain")} />
			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-12 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<div className="flex items-center gap-1">
								<Skeleton className="h-3.5 w-3.5 rounded-full" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Domain{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								{isFailed
									? "---"
									: lastUpdated
										? formatRelativeTime(lastUpdated)
										: "---"}
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
					<h1 className="font-medium text-title-h6 leading-8">{domainId}</h1>
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-9 w-32 rounded-lg" />
							<Skeleton className="h-9 w-9 rounded-lg" />
						</>
					) : isFailed ? (
						<Button.Root variant="error" size="small" mode="lighter">
							Try Again
						</Button.Root>
					) : (
						<>
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={onVerify}
								disabled={isVerifying || status === "verifying"}
							>
								{isVerifying || status === "verifying" ? (
									<>
										<Spinner size={16} color="currentColor" />
										Verifying
									</>
								) : (
									"Verify DNS Records"
								)}
							</Button.Root>
							<PopoverRoot>
								<PopoverTrigger asChild>
									<Button.Root variant="neutral" mode="stroke" size="xsmall">
										<Icon name="more-vertical" className="h-3.5 w-3.5 text-text-sub-600" />
									</Button.Root>
								</PopoverTrigger>
								<PopoverContent align="end" sideOffset={8} className="w-44 p-1.5 rounded-xl" showArrow>
									<div className="relative">
										{headerMenuItems.map((item, idx) => (
											<button
												key={item.id}
												ref={(el) => {
													if (el) buttonRefs.current[idx] = el;
												}}
												type="button"
												onPointerEnter={() => setHoverIdx(idx)}
												onPointerLeave={() => setHoverIdx(undefined)}
												onClick={() => {
													if (item.id === "docs") {
														window.open("https://reloop.sh/docs/domain", "_blank");
													} else if (item.id === "delete") {
														setDeleteId(domainId);
													}
												}}
												className={cn(
													"flex w-full cursor-pointer items-center gap-2 rounded-lg pl-2 py-1.5 text-xs font-normal transition-colors",
													item.isDanger ? "text-error-base" : "text-text-strong-950",
													!currentRect && hoverIdx === idx && (item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10")
												)}
											>
												<Icon
													name={item.icon}
													className={cn("h-3.5 w-3.5", item.isDanger ? "" : "text-text-sub-600")}
												/>
												<span>{item.label}</span>
											</button>
										))}
										<AnimatedHoverBackground
											rect={currentRect}
											tabElement={currentTab}
											isDanger={isDanger}
										/>
									</div>
								</PopoverContent>
							</PopoverRoot>
						</>
					)}
				</div>
			</div>
			<DeleteDomainModal
				domains={[
					{
						id: domainId,
						domain: domainId,
						organizationId: "",
						userId: "",
						domainType: "custom" as const,
						status: "active" as const,
						userVerified: false,
						systemVerified: false,
						dnsConfigured: false,
						nameservers: null,
						spfRecord: null,
						dkimRecord: null,
						dkimSelector: "reloop",
						dmarcRecord: null,
						dmarcPolicy: "none",
						trackingDomain: false,
						verificationFailedReason: null,
						deletedAt: null,
						lastVerifiedAt: null,
						createdAt: "",
						updatedAt: "",
					} satisfies Domain,
				]}
			/>
		</div>
	);
};
