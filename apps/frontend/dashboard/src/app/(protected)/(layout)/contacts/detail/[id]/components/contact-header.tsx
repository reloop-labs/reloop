"use client";
import { DeleteContactModal } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/contacts/delete-contact-modal";
import { EditContactModal } from "@fe/dashboard/app/(protected)/(layout)/contacts/components/contacts/edit-contact-modal";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { AudienceStatus } from "@fe/dashboard/utils/audience";
import {
	getStatusIcon as getSharedStatusIcon,
	getStatusColorClass,
	getStatusLabel,
} from "@fe/dashboard/utils/audience";
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

interface ContactData {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: AudienceStatus;
	properties?: Record<string, string | number>;
	groups?: { id: string; name: string }[];
	organizationId: string;
	suppressionReason: "hard_bounce" | "spam_complaint" | null;
	suppressedAt: string | null;
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
	enrolledChannels?: { id: string; name: string }[];
}

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
	enrolledChannels = [],
}: ContactHeaderProps) => {
	const { activeOrganization } = useUserOrganization();
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
			router.push("/contacts");
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
				<AnimatedBackButton onClick={() => router.push("/contacts")} />
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
				<AnimatedBackButton onClick={() => router.push("/contacts")} />
				<div className="flex items-center justify-between pt-6">
					<div>
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
											name="more-horizontal"
											className="h-3.5 w-3.5 text-text-sub-600"
										/>
									</Button.Root>
								</PopoverTrigger>
								<PopoverContent
									align="end"
									sideOffset={0}
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
						) : null}
					</div>
				</div>

				{/* Stats Grid - Row 1 */}
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
								{contact?.createdAt
									? formatRelativeTime(contact.createdAt)
									: "---"}
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
							<div className="flex flex-col gap-1.5">
								<div
									className={cn(
										"flex items-center gap-1.5 font-medium text-[13px]",
										getStatusColorClass(contact?.status as AudienceStatus),
									)}
								>
									<Icon
										name={getSharedStatusIcon(
											contact?.status as AudienceStatus,
										)}
										className="h-3.5 w-3.5"
									/>
									{getStatusLabel(contact?.status as AudienceStatus)}
								</div>
								{contact?.suppressionReason && (
									<div className="flex w-fit items-center gap-1 rounded-md bg-red-alpha-10 px-2 py-0.5">
										<Icon
											name="alert-circle"
											className="h-3 w-3 flex-shrink-0 text-error-base"
										/>
										<span className="font-medium text-[11px] text-error-base">
											Suppressed
											{" · "}
											{contact.suppressionReason === "hard_bounce"
												? "Hard Bounce"
												: "Spam Complaint"}
										</span>
									</div>
								)}
							</div>
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
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon name="modules" className="h-3.5 w-3.5 text-text-sub-600" />
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Groups
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-32 rounded-lg" />
						) : contact?.groups && contact.groups.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{contact.groups.map((group) => (
									<Link
										key={group.id}
										href={`/contacts/groups/${group.id}`}
										className="font-medium text-paragraph-sm text-text-strong-950 underline decoration-dashed underline-offset-2 transition-colors hover:text-primary-base"
									>
										{group.name}
									</Link>
								))}
							</div>
						) : (
							<span className="font-medium text-paragraph-sm text-text-soft-400 italic">
								No groups
							</span>
						)}
					</div>
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-1.5">
							<Icon
								name="notification-indicator"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
							<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
								Channels
							</span>
						</div>
						{isLoading ? (
							<Skeleton className="h-5 w-32 rounded-lg" />
						) : enrolledChannels.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{enrolledChannels.map((channel) => (
									<Link
										key={channel.id}
										href={`/contacts/channels/${channel.id}`}
										className="font-medium text-paragraph-sm text-text-strong-950 underline decoration-dashed underline-offset-2 transition-colors hover:text-primary-base"
									>
										{channel.name}
									</Link>
								))}
							</div>
						) : (
							<span className="font-medium text-paragraph-sm text-text-soft-400 italic">
								No channels
							</span>
						)}
					</div>
				</div>

				{/* Suppression Banner */}
				{!isLoading && contact?.suppressionReason && (
					<div className="mt-8 flex items-start gap-3 rounded-2xl border border-error-base/30 bg-error-base/10 px-4 py-3">
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
					contact={{ ...contact, properties: contact.properties ?? {} }}
				/>
			)}

			{/* Delete Contact Modal */}
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
