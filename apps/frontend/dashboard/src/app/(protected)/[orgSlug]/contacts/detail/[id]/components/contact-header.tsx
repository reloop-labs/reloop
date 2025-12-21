"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
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
import { DeleteContactModal } from "../../../components/delete-contact-modal";
import { EditContactModal } from "../../../components/edit-contact-modal";

interface ContactData {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface PropertyValueWithName {
	id: string;
	propertyId: string;
	value: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

interface ContactHeaderProps {
	contact: ContactData | undefined;
	isLoading: boolean;
	propertyValues: PropertyValueWithName[];
	enrolledTopics?: { id: string; name: string }[];
}

const getStatusColor = (status: string) => {
	return status.toLowerCase() === "subscribed"
		? "text-success-base"
		: "text-error-base";
};

const getStatusIcon = (status: string) => {
	return status.toLowerCase() === "subscribed"
		? "check-circle"
		: "cross-circle";
};

const getStatusBadgeStyles = (status: string) => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "border border-success-base text-success-base bg-success-light/20";
		case "unsubscribed":
			return "border border-error-base text-error-base bg-error-light/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};

const formatStatusLabel = (status: string) => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "Subscribed";
		case "unsubscribed":
			return "Unsubscribed";
		default:
			return status;
	}
};

// Convert camelCase to Title Case (e.g., "firstName" -> "FIRST NAME")
const formatPropertyName = (name: string) => {
	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.toUpperCase()
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
	enrolledTopics = [],
}: ContactHeaderProps) => {
	const { push, activeOrganization } = useUserOrganization();
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
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
		// Navigate back to contacts list
		if (activeOrganization?.slug) {
			router.push(`/${activeOrganization.slug}/contacts`);
		}
	};

	const handleMenuItemClick = (itemId: string) => {
		if (itemId === "edit") {
			setIsEditModalOpen(true);
		} else if (itemId === "delete") {
			setIsDeleteModalOpen(true);
		}
	};

	if (!contact && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => push("/contacts")} />
				<div className="flex items-center justify-between pt-6">
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
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={() => push("/contacts")} />
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
									Contact{" "}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									{contact?.createdAt
										? formatRelativeTime(contact.createdAt)
										: "---"}
								</p>
								<p className="font-semibold text-paragraph-xs text-text-sub-600">
									•
								</p>
								<div
									className={`flex items-center gap-1 ${getStatusColor(contact?.status || "")}`}
								>
									<Icon
										name={getStatusIcon(contact?.status || "")}
										className="h-3.5 w-3.5"
									/>
									<p className="font-medium text-paragraph-xs">
										{formatStatusLabel(contact?.status || "")}
									</p>
								</div>
							</div>
						)}
						{isLoading ? (
							<Skeleton className="mt-2 h-7 w-48 rounded-lg" />
						) : (
							<div className="flex items-center gap-1">
								<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white text-xs uppercase tracking-wide shadow-sm">
									{contact?.email.charAt(0).toUpperCase()}
								</div>
								<h1 className="font-medium text-title-h6 leading-8">
									{contact?.email}
								</h1>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{isLoading ? (
							<Skeleton className="h-9 w-9 rounded-lg" />
						) : contact ? (
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
						) : null}
					</div>
				</div>

				{/* Stats Grid - Row 1 */}
				<div className="mt-10 grid grid-cols-3 gap-x-12 gap-y-6">
					{/* Email Address */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="mail-single"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Email Address
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-32 rounded-lg" />
						) : (
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{contact?.email || "---"}
							</span>
						)}
					</div>

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
								{contact?.createdAt
									? formatRelativeTime(contact.createdAt)
									: "---"}
							</span>
						)}
					</div>

					{/* Status */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="check-circle"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
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
									getStatusBadgeStyles(contact?.status || ""),
								)}
							>
								{formatStatusLabel(contact?.status || "")}
							</span>
						)}
					</div>

					{/* Contact ID */}
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
									{contact?.id?.slice(0, 18)}...
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
					<div className="col-span-2 flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="notification-indicator"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Topics
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-32 rounded-lg" />
						) : enrolledTopics.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{enrolledTopics.map((topic) => (
									<Link
										key={topic.id}
										href={`/${activeOrganization?.slug}/topics/${topic.id}`}
										className="font-medium text-paragraph-sm text-text-strong-950 underline decoration-dashed underline-offset-2 transition-colors hover:text-primary-base"
									>
										{topic.name}
									</Link>
								))}
							</div>
						) : (
							<span className="font-medium text-paragraph-sm text-text-soft-400 italic">
								No topics
							</span>
						)}
					</div>
				</div>

				{/* Properties Section - All in one grid */}
				<div className="mt-12">
					<h3 className="mb-4 font-medium text-paragraph-sm text-text-strong-950">
						Properties
					</h3>
					<div className="grid grid-cols-3 gap-x-8 gap-y-8">
						{/* System Properties */}
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								FIRST NAME
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{contact?.firstName || "-"}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								LAST NAME
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{contact?.lastName || "-"}
							</span>
						</div>
						{/* Custom Properties */}
						{propertyValues.map((pv) => (
							<div key={pv.id} className="flex flex-col gap-1">
								<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
									{formatPropertyName(pv.name)}
								</span>
								<span className="font-medium text-paragraph-sm text-text-strong-950">
									{pv.value || "-"}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Edit Contact Modal */}
			{contact && (
				<EditContactModal
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					contact={contact}
				/>
			)}

			{/* Delete Contact Modal */}
			{contact && (
				<DeleteContactModal
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					contact={contact}
					onDeleteSuccess={handleDeleteSuccess}
				/>
			)}
		</>
	);
};
