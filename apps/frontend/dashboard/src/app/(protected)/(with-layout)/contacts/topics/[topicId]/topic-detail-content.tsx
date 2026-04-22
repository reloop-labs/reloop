"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
	ContactFilterDropdown,
	type ContactFilters,
} from "../../components/contact-filter-dropdown";
import { ContactTable } from "./components/contact-table";

interface TopicData {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription: "opt_in" | "opt_out";
	visibility: "private" | "public";
	createdAt: string;
	updatedAt: string;
}

interface Subscription {
	id: string;
	contactId: string;
	topicId: string;
	organizationId: string;
	status: "subscribed" | "unsubscribed";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface SubscriptionListResponse {
	subscriptions: Subscription[];
	total: number;
	page: number;
	limit: number;
}

const getVisibilityColor = (visibility?: "private" | "public") => {
	return visibility === "public" ? "text-primary-base" : "text-text-sub-600";
};

const getVisibilityBadgeStyles = (visibility?: "private" | "public") => {
	return visibility === "public"
		? "border border-primary-base text-primary-base bg-primary-light/20"
		: "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
};

const getDefaultSubscriptionBadgeStyles = (
	defaultSubscription?: "opt_in" | "opt_out",
) => {
	return defaultSubscription === "opt_in"
		? "border border-success-base text-success-base bg-success-light/20"
		: "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
};

const formatSubscriptionLabel = (
	defaultSubscription?: "opt_in" | "opt_out",
) => {
	return defaultSubscription === "opt_in" ? "Opt In" : "Opt Out";
};

const topicMenuItems = [
	{
		id: "edit",
		label: "Edit topic",
		icon: "edit" as const,
		isDanger: false,
	},
	{
		id: "delete",
		label: "Delete topic",
		icon: "trash" as const,
		isDanger: true,
	},
];

export const TopicDetailContent = () => {
	const { topicId } = useParams();
	const [, setModal] = useQueryState("modal", { history: "replace" });
	const [, setId] = useQueryState("id", { history: "replace" });
	const [copied, setCopied] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const [filters, setFilters] = useState<ContactFilters>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");

	const statusFilter = useMemo(() => {
		if (filters.length === 0 || filters.length === 2) return "all";
		if (filters.includes("subscribed")) return "subscribed";
		if (filters.includes("unsubscribed")) return "unsubscribed";
		return "all";
	}, [filters]);

	const {
		data: topicData,
		error: topicError,
		isLoading: topicLoading,
	} = useSWR<TopicData>(topicId ? `/api/contacts/v1/topics/${topicId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	const { data: subscriptionData, isLoading: subscriptionLoading } =
		useSWR<SubscriptionListResponse>(
			`/api/contacts/v1/subscriptions/list?topicId=${topicId}&limit=100`,
			{
				revalidateOnFocus: true,
				revalidateOnReconnect: true,
			},
		);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = topicMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleCopyId = async () => {
		if (!topicData?.id) return;

		try {
			await navigator.clipboard.writeText(topicData.id);
			toast.success("Topic ID copied to clipboard");
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy ID");
		}
	};

	const handleMenuItemClick = (itemId: string) => {
		if (!topicData?.id) return;

		setId(topicData.id);
		setModal(itemId === "edit" ? "edit-topic" : "delete-topic");
	};

	const isLoading = topicLoading || subscriptionLoading;

	const handleUnsubscribe = async (contactId: string) => {
		toast.error("Not implemented");
	};

	const handleDownloadCSV = async () => {
		try {
			if (
				!subscriptionData?.subscriptions ||
				subscriptionData.subscriptions.length === 0
			) {
				toast.error("No contacts to export");
				return;
			}

			const headers = ["Contact ID", "Status", "Subscribed At"];
			const csvRows = subscriptionData.subscriptions.map((sub) => [
				sub.contactId,
				sub.status,
				new Date(sub.createdAt).toISOString(),
			]);

			const csvContent = [
				headers.join(","),
				...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
			].join("\n");

			const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = `topic_contacts_${new Date().toISOString().split("T")[0]}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);

			toast.success("Contacts exported successfully");
		} catch (error) {
			console.error("Failed to download CSV:", error);
			toast.error("Failed to export contacts");
		}
	};

	const filteredSubscriptions =
		subscriptionData?.subscriptions?.filter((sub) => {
			const matchesStatus =
				statusFilter === "all" || sub.status === statusFilter;
			const matchesSearch =
				searchQuery === "" ||
				sub.contactId.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	if (topicError) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => window.history.back()} />
				<div className="pt-6">
					<div className="flex items-center gap-1.5">
						<p className="font-medium text-paragraph-xs text-text-sub-600">
							Topic
						</p>
						<p className="font-semibold text-paragraph-xs text-text-sub-600">
							•
						</p>
						<p className="font-medium text-paragraph-xs text-text-sub-600">
							---
						</p>
						<p className="font-semibold text-paragraph-xs text-text-sub-600">
							•
						</p>
						<div className="flex items-center gap-1 text-error-base">
							<Icon name="alert-circle" className="h-3.5 w-3.5" />
							<p className="font-medium text-paragraph-xs">Not found</p>
						</div>
					</div>
					<h1 className="pt-2 font-medium text-title-h6 leading-8">
						Topic not found
					</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="pt-10 pb-8">
			<AnimatedBackButton onClick={() => window.history.back()} />

			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-10 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-12 rounded-full" />
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Topic
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								{topicData?.createdAt
									? formatRelativeTime(topicData.createdAt)
									: "---"}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div
								className={cn(
									"flex items-center gap-1",
									getVisibilityColor(topicData?.visibility),
								)}
							>
								<Icon
									name={topicData?.visibility === "public" ? "globe" : "lock"}
									className="h-3.5 w-3.5"
								/>
								<p className="font-medium text-paragraph-xs capitalize">
									{topicData?.visibility || "private"}
								</p>
							</div>
						</div>
					)}

					{isLoading ? (
						<Skeleton className="mt-2 h-7 w-56 rounded-lg" />
					) : (
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-600 to-neutral-500 text-white shadow-sm">
								<Icon name="notification-indicator" className="h-3 w-3" />
							</div>
							<h1 className="font-medium text-title-h6 leading-8">
								{topicData?.name}
							</h1>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-9 w-36 rounded-lg" />
							<Skeleton className="h-9 w-9 rounded-lg" />
						</>
					) : topicData ? (
						<>
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={() => setModal("add-contact-to-topic")}
								className="gap-2"
							>
								<Icon name="plus" className="h-4 w-4" />
								Add Contact
								<span className="inline-flex items-center gap-0.5">
									<Icon
										name="command"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
									<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
										a
									</span>
								</span>
							</Button.Root>
							<PopoverRoot>
								<PopoverTrigger asChild>
									<Button.Root variant="neutral" mode="stroke" size="xsmall">
										<Icon
											name="more-vertical"
											className="h-3.5 w-3.5 text-text-sub-600"
										/>
									</Button.Root>
								</PopoverTrigger>
								<PopoverContent
									align="end"
									sideOffset={8}
									className="w-44 rounded-xl p-1.5"
									showArrow
								>
									<div className="relative">
										{topicMenuItems.map((item, idx) => (
											<button
												key={item.id}
												ref={(el) => {
													if (el) buttonRefs.current[idx] = el;
												}}
												type="button"
												onPointerEnter={() => setHoverIdx(idx)}
												onPointerLeave={() => setHoverIdx(undefined)}
												onClick={() => handleMenuItemClick(item.id)}
												className={cn(
													"flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pl-2 font-normal text-xs transition-colors",
													item.isDanger
														? "text-error-base"
														: "text-text-strong-950",
													!currentRect &&
														hoverIdx === idx &&
														(item.isDanger
															? "bg-red-alpha-10"
															: "bg-neutral-alpha-10"),
												)}
											>
												<Icon
													name={item.icon}
													className={cn(
														"h-4 w-4",
														item.isDanger ? "" : "text-text-sub-600",
													)}
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
					) : null}
				</div>
			</div>

			<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="file-text" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Description
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-40 rounded-lg" />
					) : (
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{topicData?.description || "No description"}
						</span>
					)}
				</div>

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
							{topicData?.createdAt
								? formatRelativeTime(topicData.createdAt)
								: "---"}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon
							name="eye-outline"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Visibility
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-lg" />
					) : (
						<span
							className={cn(
								"inline-flex w-fit rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px] capitalize",
								getVisibilityBadgeStyles(topicData?.visibility),
							)}
						>
							{topicData?.visibility || "private"}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="hash" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							ID
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-6 w-28 rounded-lg" />
					) : (
						<button
							className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
							type="button"
							onClick={handleCopyId}
						>
							<code className="max-w-[120px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
								{topicData?.id?.slice(0, 18)}...
							</code>
							<Icon
								name={copied ? "check" : "copy"}
								className={cn(
									"h-3 w-3 flex-shrink-0 transition-all",
									copied ? "text-success-base" : "text-text-sub-600",
								)}
							/>
						</button>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="users" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Default Enrollment
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-20 rounded-lg" />
					) : (
						<span
							className={cn(
								"inline-flex w-fit rounded-md border-[1px] px-[6px] py-0.5 font-medium text-[10px]",
								getDefaultSubscriptionBadgeStyles(
									topicData?.defaultSubscription,
								),
							)}
						>
							{formatSubscriptionLabel(topicData?.defaultSubscription)}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Icon name="user" className="h-3.5 w-3.5 text-text-sub-600" />
						<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
							Contacts
						</span>
					</div>
					{isLoading ? (
						<Skeleton className="h-5 w-10 rounded-lg" />
					) : (
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{subscriptionData?.total || 0}
						</span>
					)}
				</div>
			</div>

			<div className="mt-12">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex-1">
						<Input.Root size="xsmall">
							<Input.Wrapper>
								<Input.Icon as={Icon} name="search" size="xsmall" />
								<Input.Input
									placeholder="Search by contact ID"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>

					<ContactFilterDropdown value={filters} onChange={setFilters} />
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={handleDownloadCSV}
						disabled={
							!subscriptionData?.subscriptions ||
							subscriptionData.subscriptions.length === 0
						}
						title="Export CSV"
					>
						<Icon name="file-download" className="h-4 w-4" />
					</Button.Root>
				</div>

				<ContactTable
					subscriptions={filteredSubscriptions}
					isLoading={subscriptionLoading}
					loadingRows={5}
					onUnsubscribe={handleUnsubscribe}
					onAddContact={() => setModal("add-contact-to-topic")}
					emptyStateTitle="No contacts yet"
					emptyStateDescription="Add contacts to this topic to organize and start managing them."
					emptyStateButtonText="Add First Contact"
				/>
			</div>
		</div>
	);
};
