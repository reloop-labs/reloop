import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { AudienceStatus } from "#/features/contacts/audience";
import {
	getStatusIcon as getSharedStatusIcon,
	getStatusColorClass,
	getStatusLabel,
} from "#/features/contacts/audience";
import type { ContactDetail } from "#/features/contacts/hooks/use-contacts-query";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { DeleteContactModal } from "../components/contacts/delete-contact-modal";
import { EditContactModal } from "../components/contacts/edit-contact-modal";
import type { ActivityFilter } from "./contact-email-history";
import { ContactEmailHistory } from "./contact-email-history";

interface PropertyValueWithName {
	id: string;
	propertyId: string;
	value: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

interface ContactHeaderProps {
	contact: ContactDetail | undefined;
	isLoading: boolean;
	propertyValues: PropertyValueWithName[];
	enrolledChannels?: { id: string; name: string }[];
}

type DetailTab = "overview" | "emails" | "changes" | "properties";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
	{ id: "overview", label: "Overview" },
	{ id: "emails", label: "Emails" },
	{ id: "changes", label: "Changes" },
	{ id: "properties", label: "Properties" },
];

const formatPropertyName = (name: string) => {
	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();
};

const headerMenuItems = [
	{ id: "edit", label: "Edit contact", icon: "edit" as const, isDanger: false },
	{
		id: "delete",
		label: "Delete contact",
		icon: "trash" as const,
		isDanger: true,
	},
];

export const ContactHeader = ({
	contact,
	isLoading,
	propertyValues,
	enrolledChannels = [],
}: ContactHeaderProps) => {
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [tab, setTab] = useState<DetailTab>("overview");
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = headerMenuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleCopyId = async () => {
		if (contact?.id) {
			try {
				await navigator.clipboard.writeText(contact.id);
				toast.success("Contact ID copied to clipboard");
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy ID");
			}
		}
	};

	const handleDeleteSuccess = () => {
		toast.success("Contact deleted");
		router.push("/contacts");
	};

	const handleMenuItemClick = (itemId: string) => {
		if (itemId === "edit") {
			setIsEditModalOpen(true);
		} else if (itemId === "delete") {
			setIsDeleteModalOpen(true);
		}
	};

	const displayName =
		contact?.firstName || contact?.lastName
			? `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`.trim()
			: (contact?.email ?? "Contact");
	const initial = (displayName.charAt(0) || "?").toUpperCase();

	const statusLabel = contact?.status
		? getStatusLabel(contact.status as AudienceStatus)
		: null;
	const groupCount = contact?.groups?.length ?? 0;
	const channelCount = enrolledChannels.length;

	const activityFilter: ActivityFilter =
		tab === "emails" ? "emails" : tab === "changes" ? "changes" : "all";
	const showActivity = tab !== "properties";
	const showProperties = tab === "overview" || tab === "properties";

	if (!contact && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Contact{" "}
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
						<h1 className="font-medium text-title-h6 leading-8">
							Contact not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto w-full max-w-[760px] pb-16">
				{/* Pastel banner */}
				<div className="h-28 rounded-2xl bg-gradient-to-r from-[#F9DEE2] via-[#FCF0E3] to-[#DCEEF6] sm:h-32 dark:from-[#F9DEE2]/25 dark:via-[#FCF0E3]/15 dark:to-[#DCEEF6]/20" />

				<div className="px-4 sm:px-6">
					{/* Avatar overlapping the banner */}
					<div className="-mt-10 mb-4">
						{isLoading ? (
							<Skeleton className="size-20 rounded-full" />
						) : (
							<div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-2xl text-white uppercase tracking-wide shadow-sm ring-4 ring-white dark:ring-[#0a0a0b]">
								{initial}
							</div>
						)}
					</div>

					{/* Name */}
					{isLoading ? (
						<Skeleton className="h-7 w-48 rounded-lg" />
					) : (
						<h1 className="font-medium text-[22px] text-text-strong-950 tracking-tight">
							{displayName}
						</h1>
					)}

					{/* Meta line */}
					{isLoading ? (
						<Skeleton className="mt-2 h-4 w-64 rounded" />
					) : (
						<p className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] text-text-sub-600">
							{statusLabel && <span>{statusLabel}</span>}
							<span>
								{groupCount} group{groupCount === 1 ? "" : "s"}
							</span>
							<span>
								{channelCount} channel{channelCount === 1 ? "" : "s"}
							</span>
						</p>
					)}

					{/* Actions */}
					<div className="mt-4 flex items-center gap-2">
						{isLoading ? (
							<Skeleton className="h-9 w-28 rounded-lg" />
						) : (
							<>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={() => setIsEditModalOpen(true)}
								>
									Edit contact
								</Button.Root>
								{contact && (
									<PopoverRoot>
										<PopoverTrigger asChild>
											<Button.Root
												variant="neutral"
												mode="stroke"
												size="xsmall"
											>
												<Icon
													name="more-horizontal"
													className="h-3.5 w-3.5 text-text-sub-600"
												/>
											</Button.Root>
										</PopoverTrigger>
										<PopoverContent
											align="start"
											sideOffset={4}
											className="w-44 rounded-xl p-1.5"
											showArrow
										>
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
														onClick={() => handleMenuItemClick(item.id)}
														className={cn(
															"flex w-full cursor-pointer items-center gap-2 rounded-lg py-1.5 pl-2 font-medium text-xs transition-colors",
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
								)}
							</>
						)}
					</div>

					{!isLoading && contact?.suppressionReason && (
						<div className="mt-6 flex items-start gap-3 rounded-2xl border border-error-base/30 bg-error-base/10 px-4 py-3">
							<Icon
								name="alert-octagon"
								className="mt-0.5 h-5 w-5 flex-shrink-0 text-error-base"
							/>
							<div className="flex flex-col gap-0.5">
								<h3 className="font-medium text-error-base text-sm">
									Contact Suppressed
								</h3>
								<p className="text-error-base/80 text-sm">
									This contact has been automatically excluded from all
									communications due to a delivery issue or spam report.
								</p>
							</div>
						</div>
					)}

					{/* Tabs */}
					<div
						className="mt-8 flex gap-6 overflow-x-auto border-stroke-soft-200 border-b dark:border-white/10"
						role="tablist"
						aria-label="Contact sections"
					>
						{DETAIL_TABS.map((t) => {
							const active = tab === t.id;
							return (
								<button
									key={t.id}
									type="button"
									role="tab"
									aria-selected={active}
									onClick={() => setTab(t.id)}
									className={cn(
										"-mb-px shrink-0 cursor-pointer border-b-2 pb-3 text-[15px] transition-colors",
										active
											? "border-text-strong-950 font-medium text-text-strong-950"
											: "border-transparent text-text-sub-600 hover:text-text-strong-950",
									)}
								>
									{t.label}
								</button>
							);
						})}
					</div>

					{/* Tab content */}
					<div className="mt-8 flex flex-col gap-10">
						{showActivity && contact?.email && (
							<ContactEmailHistory
								contactId={contact.id}
								email={contact.email}
								contactCreatedAt={contact.createdAt}
								filter={activityFilter}
							/>
						)}

						{showProperties && (
							<section>
								<h3 className="mb-3 text-[15px] text-text-sub-600">
									Properties
								</h3>
								{isLoading ? (
									<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
										{[0, 1, 2, 3].map((i) => (
											<div
												key={`property-skeleton-${i}`}
												className="flex items-center justify-between border-stroke-soft-200 border-b px-4 py-4 last:border-b-0 sm:px-5 dark:border-white/10"
											>
												<Skeleton className="h-4 w-24 rounded" />
												<Skeleton className="h-4 w-32 rounded" />
											</div>
										))}
									</div>
								) : (
									<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Email
											</span>
											<span className="truncate font-medium text-[15px] text-text-strong-950">
												{contact?.email}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												First name
											</span>
											<span className="font-medium text-[15px] text-text-strong-950">
												{contact?.firstName || "—"}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Last name
											</span>
											<span className="font-medium text-[15px] text-text-strong-950">
												{contact?.lastName || "—"}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Status
											</span>
											<span
												className={cn(
													"flex items-center gap-1.5 font-medium text-[15px]",
													getStatusColorClass(
														contact?.status as AudienceStatus,
													),
												)}
											>
												<Icon
													name={
														getSharedStatusIcon(
															contact?.status as AudienceStatus,
														) as Parameters<typeof Icon>[0]["name"]
													}
													className="h-3.5 w-3.5"
												/>
												{statusLabel}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Groups
											</span>
											{contact?.groups && contact.groups.length > 0 ? (
												<span className="flex max-w-[60%] flex-wrap justify-end gap-x-3 gap-y-1">
													{contact.groups.map((group) => (
														<Link
															href={`/contacts/groups/${group.id}`}
															key={group.id}
															className="font-medium text-[15px] text-text-strong-950 underline decoration-dashed underline-offset-4 transition-colors hover:text-primary-base"
														>
															{group.name}
														</Link>
													))}
												</span>
											) : (
												<span className="text-[15px] text-text-soft-400">
													—
												</span>
											)}
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Channels
											</span>
											{enrolledChannels.length > 0 ? (
												<span className="max-w-[60%] truncate font-medium text-[15px] text-text-strong-950">
													{enrolledChannels.map((c) => c.name).join(" · ")}
												</span>
											) : (
												<span className="text-[15px] text-text-soft-400">
													—
												</span>
											)}
										</div>
										{propertyValues.map((pv, idx) => {
											const isLast =
												idx === propertyValues.length - 1 &&
												!contact?.createdAt;
											return (
												<div
													key={pv.id}
													className={cn(
														"flex items-center justify-between gap-4 px-4 py-4 sm:px-5",
														!isLast &&
															"border-stroke-soft-200 border-b dark:border-white/10",
													)}
												>
													<span className="font-medium text-[15px] text-text-strong-950">
														{formatPropertyName(pv.name)}
													</span>
													<span className="max-w-[60%] truncate text-right font-medium text-[15px] text-text-strong-950">
														{pv.value || "—"}
													</span>
												</div>
											);
										})}
										{contact?.createdAt && (
											<div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
												<span className="font-medium text-[15px] text-text-strong-950">
													Created
												</span>
												<span className="font-medium text-[15px] text-text-strong-950">
													{formatRelativeTime(contact.createdAt)}
												</span>
											</div>
										)}
										{contact?.id && (
											<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-t px-4 py-4 sm:px-5 dark:border-white/10">
												<span className="font-medium text-[15px] text-text-strong-950">
													ID
												</span>
												<button
													className="group/copy flex cursor-pointer items-center gap-1.5"
													type="button"
													onClick={handleCopyId}
												>
													<code className="max-w-[160px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
														{contact.id.slice(0, 18)}...
													</code>
													<Icon
														name={copied ? "check" : "copy"}
														className={cn(
															"h-3 w-3 flex-shrink-0 transition-all",
															copied
																? "text-success-base"
																: "text-text-sub-600",
														)}
													/>
												</button>
											</div>
										)}
									</div>
								)}
							</section>
						)}
					</div>
				</div>
			</div>

			{contact && (
				<EditContactModal
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					contact={{ ...contact, properties: contact.properties ?? {} }}
				/>
			)}

			{contact && (
				<DeleteContactModal
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					contact={{ ...contact, properties: contact.properties ?? {} }}
					onDeleteSuccess={handleDeleteSuccess}
				/>
			)}
		</>
	);
};
