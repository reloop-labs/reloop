"use client";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";

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

const getStatusColor = (status: Domain["status"]) => {
	switch (status) {
		case "active":
			return "bg-green-500";
		case "verifying":
			return "bg-yellow-500";
		case "start-verify":
			return "bg-blue-500";
		case "suspended":
			return "bg-orange-500";
		case "failed":
			return "bg-red-500";
		default:
			return "bg-gray-500";
	}
};

const getStatusLabel = (status: Domain["status"]) => {
	switch (status) {
		case "active":
			return "Active";
		case "verifying":
			return "Verifying";
		case "start-verify":
			return "Verify";
		case "suspended":
			return "Suspended";
		case "failed":
			return "Failed";
		default:
			return status;
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
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
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
													className="h-4 w-4 text-text-sub-600"
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
												className={`h-2 w-2 flex-shrink-0 rounded-full ${getStatusColor(domain.status)}`}
												title={getStatusLabel(domain.status)}
											/>
											<span className="text-label-sm text-text-strong-950">
												{getStatusLabel(domain.status)}
											</span>
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
										<motion.button
											{...getAnimationProps(index + 1, 3)}
											type="button"
											className="flex items-center justify-center rounded p-1 hover:bg-bg-weak-100"
										>
											<Icon
												name="more-horizontal"
												className="h-4 w-4 text-text-sub-600 hover:text-text-strong-950"
											/>
										</motion.button>
									</div>
								</div>
							))}
				</div>
			</div>
		</AnimatePresence>
	);
};
