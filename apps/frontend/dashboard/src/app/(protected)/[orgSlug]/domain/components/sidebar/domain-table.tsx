"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import { Icon as BadgeIcon, Root as BadgeRoot } from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";

interface Domain {
	id: string;
	domain: string;
	organizationId: string;
	userId: string;
	domainType: "custom" | "subdomain" | "system";
	status: "start-verify" | "verifying" | "active" | "suspended" | "failed";
	userVerified: boolean;
	systemVerified: boolean;
	dnsConfigured: boolean;
	createdAt: string;
	updatedAt: string;
}

interface DomainTableProps {
	domains: Domain[];
	activeOrganizationSlug: string;
	currentDomainId?: string;
	isLoading?: boolean;
	loadingRows?: number;
}

const getStatusLabel = (status: Domain["status"]) => {
	switch (status) {
		case "active":
			return "Active";
		case "verifying":
			return "Verifying";
		case "start-verify":
			return "Not Started";
		case "suspended":
			return "Suspended";
		case "failed":
			return "Failed";
		default:
			return status;
	}
};

const getStatusColorClass = (status: Domain["status"]) => {
	switch (status) {
		case "start-verify":
			return "text-text-sub-600";
		case "verifying":
			return "text-warning-base";
		case "active":
			return "text-success-base";
		case "failed":
		case "suspended":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
};

const getStatusIcon = (status: Domain["status"]) => {
	switch (status) {
		case "start-verify":
			return "minus-circle";
		case "verifying":
			return "time";
		case "active":
			return "check-circle";
		case "failed":
			return "cross-circle";
		default:
			return "minus-circle";
	}
};

function getAnimationProps(row: number, column: number) {
	return {
		initial: { opacity: 0, y: "-100%" },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: "100%" },
		transition: {
			duration: 0.5,
			delay: row * 0.07 + column * 0.1,
			ease: [0.65, 0, 0.35, 1] as const,
		},
	};
}

export const DomainTable = ({
	domains,
	activeOrganizationSlug,
	currentDomainId,
	isLoading,
	loadingRows = 3,
}: DomainTableProps) => {
	const { push } = useUserOrganization();
	const [, setDeleteId] = useQueryState("delete");

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const handleDeleteDomain = (domainId: string) => {
		setDeleteId(domainId);
	};

	const handleViewDetails = (domainName: string) => {
		push(`/domain/${domainName}`);
	};

	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 text-paragraph-sm shadow-regular-md ring-stroke-soft-200 ring-inset">
				<div className="grid grid-cols-[1fr_minmax(120px,auto)_minmax(100px,auto)_minmax(40px,auto)]">
					<div className="bg-bg-weak-50 pl-5 font-medium text-text-sub-600">
						<div className="py-2.5">Domain</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Status</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5">Created</div>
					</div>
					<div className="bg-bg-weak-50 font-medium text-text-sub-600">
						<div className="py-2.5" />
					</div>
					{isLoading
						? // Skeleton loading state
							Array.from({ length: loadingRows }).map((_, index) => (
								<div key={`skeleton-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="my-1 pl-5">
											<Skeleton className="h-4 w-32" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<div className="flex items-center gap-2">
											<Skeleton className="h-2 w-2 rounded-full" />
											<Skeleton className="h-4 w-16" />
										</div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-20" />
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5">
										<Skeleton className="h-4 w-4" />
									</div>
								</div>
							))
						: domains.map((domain, index) => (
								<div key={`domain-${index}`} className="group/row contents">
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 0)}
											className="flex items-center gap-2 pl-5"
										>
											<Link
												href={`/${activeOrganizationSlug}/domain/${domain.domain}`}
												className={`flex items-center gap-2 transition-colors hover:text-blue-600 ${
													currentDomainId === domain.domain
														? "text-blue-600"
														: ""
												}`}
											>
												<Icon
													name="globe"
													className={cn(
														"h-4 w-4",
														getStatusColorClass(domain.status),
													)}
												/>
												<span className="text-label-sm text-text-strong-950">
													{domain.domain}
												</span>
											</Link>
										</motion.div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 1)}
											className="flex items-center gap-2"
										>
											<div
												className={cn(
													"flex items-center gap-2.5 rounded-lg px-2.5 py-0.5 font-medium text-label-xs capitalize",
													getStatusColorClass(domain.status),
												)}
											>
												<BadgeIcon
													as={Icon}
													name={getStatusIcon(domain.status)}
													className="h-3.5 w-3.5"
												/>
												{getStatusLabel(domain.status)}
											</div>
										</motion.div>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.span
											{...getAnimationProps(index + 1, 2)}
											className="text-label-sm text-text-strong-950"
										>
											{formatDate(domain.createdAt)}
										</motion.span>
									</div>
									<div className="flex items-center border-stroke-soft-200 border-t py-2.5 group-hover/row:bg-bg-weak-50">
										<motion.div
											{...getAnimationProps(index + 1, 3)}
											className="flex items-center justify-center"
										>
											<PopoverRoot>
												<PopoverTrigger asChild>
													<Button.Root
														variant="neutral"
														mode="ghost"
														size="xxsmall"
														className="rounded p-1"
													>
														<Icon
															name="more-vertical"
															className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
														/>
													</Button.Root>
												</PopoverTrigger>
												<PopoverContent align="end" className="w-48 p-2">
													<div className="flex flex-col gap-1">
														<Button.Root
															variant="neutral"
															mode="ghost"
															size="small"
															onClick={() => handleViewDetails(domain.domain)}
															className="w-full justify-start"
														>
															<Icon name="eye-outline" className="h-4 w-4" />
															View Details
														</Button.Root>
														<Button.Root
															variant="error"
															mode="ghost"
															size="small"
															onClick={() => handleDeleteDomain(domain.id)}
															className="w-full justify-start text-red-600 hover:bg-red-50"
														>
															<Icon name="trash" className="h-4 w-4" />
															Delete
														</Button.Root>
													</div>
												</PopoverContent>
											</PopoverRoot>
										</motion.div>
									</div>
								</div>
							))}
				</div>
			</div>
		</AnimatePresence>
	);
};
