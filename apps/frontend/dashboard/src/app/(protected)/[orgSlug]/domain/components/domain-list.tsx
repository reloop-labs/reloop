"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	getStatusColorClass,
	getStatusIcon,
	getStatusLabel,
} from "@fe/dashboard/utils/domain";
import type { DomainListResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import useSWR from "swr";
import { motion } from "motion/react";
import { DeleteDomainModal } from "./delete-domain";
import { DomainSDK } from "./domain-sdk";
import { DomainTable } from "./domain-table";
import { EmptyState } from "./empty-state";
import { PageSizeDropdown } from "./page-size-dropdown";

export const DomainListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const { domainId } = useParams();
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize, setPageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const { data, error, isLoading } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?organizationId=${activeOrganization.id}&limit=${pageSize}&page=${currentPage}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	// Filter domains based on status and search query
	const filteredDomains =
		data?.domains?.filter((domain) => {
			const matchesStatus =
				statusFilter === "all" || domain.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				domain.domain.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">
					Domain{data?.domains.length !== 1 ? "s" : ""}
				</p>
				<div className="flex items-center gap-2">
					<Link
						className={Button.buttonVariants({
							variant: "neutral",
							size: "xsmall",
						}).root()}
						href={`/${activeOrganization.slug}/domain/add`}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add domain
					</Link>
					<DomainSDK />
				</div>
			</div>
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load domains
						</p>
					</div>
				) : data?.domains && data.domains.length === 0 ? (
					<EmptyState />
				) : (
					<div>
						<div className="mt-10 flex items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search domains..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div className="w-40">
								<Select.Root
									size="small"
									value={statusFilter}
									onValueChange={setStatusFilter}
								>
									<Select.Trigger className="rounded-xl">
										<Select.Value placeholder="Status" />
									</Select.Trigger>
									<Select.Content className="w-40">
										<Select.Item value="all">
											<div className="flex items-center gap-2 text-sm">
												<Icon name="globe" className="h-4 w-4" />
												All Status
											</div>
										</Select.Item>
										<Select.Item value="start-verify">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name={getStatusIcon("start-verify")}
													className={cn(
														"h-4 w-4",
														getStatusColorClass("start-verify"),
													)}
												/>
												{getStatusLabel("start-verify")}
											</div>
										</Select.Item>
										<Select.Item value="verifying">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name={getStatusIcon("verifying")}
													className={cn(
														"h-4 w-4",
														getStatusColorClass("verifying"),
													)}
												/>
												{getStatusLabel("verifying")}
											</div>
										</Select.Item>
										<Select.Item value="active">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name={getStatusIcon("active")}
													className={cn(
														"h-4 w-4",
														getStatusColorClass("active"),
													)}
												/>
												{getStatusLabel("active")}
											</div>
										</Select.Item>
										<Select.Item value="suspended">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name={getStatusIcon("suspended")}
													className={cn(
														"h-4 w-4",
														getStatusColorClass("suspended"),
													)}
												/>
												{getStatusLabel("suspended")}
											</div>
										</Select.Item>
										<Select.Item value="failed">
											<div className="flex items-center gap-2 text-sm">
												<Icon
													name={getStatusIcon("failed")}
													className={cn(
														"h-4 w-4",
														getStatusColorClass("failed"),
													)}
												/>
												{getStatusLabel("failed")}
											</div>
										</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
						<div className="mt-4">
							<DomainTable
								domains={filteredDomains}
								activeOrganizationSlug={activeOrganization.slug}
								currentDomainId={domainId as string}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>

						{/* Pagination */}
						{data && data.total > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.2, ease: [0.65, 0, 0.35, 1] }}
								className="mt-4 pb-8 flex items-center justify-between text-paragraph-sm text-text-sub-600"
							>
								<motion.div
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
									className="flex items-center gap-3"
								>
									<span>
										Showing {startIndex}–{endIndex} of {data.total} domain{data.total !== 1 ? "s" : ""}
									</span>
									<PageSizeDropdown
										value={pageSize}
										onValueChange={(value) => {
											setPageSize(value);
											setCurrentPage(1);
										}}
									/>
								</motion.div>
								<motion.div
									initial={{ opacity: 0, x: 10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.4, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
									className="flex items-center gap-2"
								>
									<Button.Root
										variant="neutral"
										mode="stroke"
										size="xxsmall"
										onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
										disabled={currentPage === 1 || isLoading}
										className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
									>
										<Icon name="chevron-left" className="h-4 w-4" />
									</Button.Root>
									<span className="px-2">
										Page {currentPage} of {totalPages}
									</span>
									<Button.Root
										variant="neutral"
										mode="stroke"
										size="xxsmall"
										onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
										disabled={currentPage === totalPages || isLoading}
										className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
									>
										<Icon name="chevron-right" className="h-4 w-4" />
									</Button.Root>
								</motion.div>
							</motion.div>
						)}
					</div>
				)}
			</div>
			<DeleteDomainModal domains={data?.domains || []} />
		</div>
	);
};
