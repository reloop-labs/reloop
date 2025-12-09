"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Select from "@reloop/ui/select";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface Member {
	id: string;
	role: string;
	user: {
		id: string;
		name: string | null;
		email: string;
		image?: string | null;
	};
	createdAt: Date;
}

const getInitials = (name: string | null, email: string) => {
	if (name) {
		return name
			.split(" ")
			.map((part) => part.charAt(0).toUpperCase())
			.join("")
			.slice(0, 2);
	}
	const emailPart = email.split("@")[0];
	if (!emailPart) return "??";
	return emailPart
		.split(".")
		.map((part) => part.charAt(0).toUpperCase())
		.join("")
		.slice(0, 2);
};

const getRoleBadgeStyles = (role: string) => {
	switch (role.toLowerCase()) {
		case "owner":
			return "bg-warning-lighter text-warning-base";
		case "admin":
			return "bg-primary-lighter text-primary-base";
		default:
			return "bg-bg-weak-50 text-text-sub-600";
	}
};

const formatRoleLabel = (role: string) => {
	switch (role.toLowerCase()) {
		case "owner":
			return "Owner";
		case "admin":
			return "Admin";
		case "member":
			return "Member";
		default:
			return role;
	}
};

/**
 * Get animation properties for staggered animations
 */
const getAnimationProps = (row: number, column: number) => {
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
};

const MemberSkeleton = () => (
	<div className="grid grid-cols-[1fr_100px_100px_80px]">
		<div className="flex items-center gap-3 px-4 py-3">
			<Skeleton className="h-10 w-10 rounded-full" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-3 w-40" />
			</div>
		</div>
		<div className="flex items-center px-4 py-3">
			<Skeleton className="h-6 w-16 rounded-full" />
		</div>
		<div className="flex items-center px-4 py-3">
			<Skeleton className="h-4 w-20" />
		</div>
		<div className="flex items-center justify-end px-4 py-3">
			<Skeleton className="h-8 w-8 rounded-lg" />
		</div>
	</div>
);

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
};

export const MemberList = () => {
	const { activeOrganization } = useUserOrganization();
	const [updatingRole, setUpdatingRole] = useState<string | null>(null);
	const [removingMember, setRemovingMember] = useState<string | null>(null);

	const { data, isLoading, error, mutate } = useSWR<{ members: Member[] }>(
		`organization-member-${activeOrganization.id}`,
		async () => {
			const result = await authClient.organization.listMembers({});
			return result.data ?? { members: [] };
		},
	);

	const handleRoleChange = async (memberId: string, newRole: "admin" | "member") => {
		setUpdatingRole(memberId);
		try {
			const { error } = await authClient.organization.updateMemberRole({
				memberId,
				role: newRole,
			});
			if (error) {
				toast.error(error.message || "Failed to update role");
				return;
			}
			toast.success("Role updated successfully");
			mutate();
		} catch (err) {
			toast.error("Failed to update role");
		} finally {
			setUpdatingRole(null);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		setRemovingMember(memberId);
		try {
			const { error } = await authClient.organization.removeMember({
				memberIdOrEmail: memberId,
			});
			if (error) {
				toast.error(error.message || "Failed to remove member");
				return;
			}
			toast.success("Member removed successfully");
			mutate();
		} catch (err) {
			toast.error("Failed to remove member");
		} finally {
			setRemovingMember(null);
		}
	};

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_100px_100px_80px] border-b border-stroke-soft-200 bg-bg-weak-50">
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Member
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Role
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Joined
					</div>
					<div className="px-4 py-3" />
				</div>
				{/* Skeleton Rows */}
				<div className="divide-y divide-stroke-soft-200">
					{Array.from({ length: 3 }).map((_, index) => (
						<MemberSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 py-12">
				<Icon name="alert-circle" className="mb-3 h-8 w-8 text-error-base" />
				<p className="font-medium text-text-strong-950">Failed to load team members</p>
				<p className="text-paragraph-sm text-text-sub-600">Please try again later</p>
			</div>
		);
	}

	if (!data?.members || data.members.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 py-12">
				<Icon name="users" className="mb-3 h-8 w-8 text-text-sub-600" />
				<p className="font-medium text-text-strong-950">No team members found</p>
				<p className="text-paragraph-sm text-text-sub-600">Invite members to get started</p>
			</div>
		);
	}

	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_100px_100px_80px] border-b border-stroke-soft-200 bg-bg-weak-50">
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Member
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Role
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Joined
					</div>
					<div className="px-4 py-3" />
				</div>

				{/* Table Body */}
				<div className="divide-y divide-stroke-soft-200">
					{data.members.map((member, index) => {
						const isOwner = member.role.toLowerCase() === "owner";
						return (
							<div
								key={member.id}
								className={cn(
									"group/row grid grid-cols-[1fr_100px_100px_80px] transition-colors",
									"hover:bg-bg-weak-50/50"
								)}
							>
								{/* Member Info Column */}
								<div className="flex items-center gap-3 px-4 py-3">
									<motion.div {...getAnimationProps(index + 1, 0)}>
										<Avatar.Root size="40" color="gray">
											{member.user.image ? (
												<Avatar.Image src={member.user.image} alt={member.user.name || member.user.email} />
											) : (
												<Avatar.Image asChild>
													<div className="flex h-full w-full items-center justify-center font-medium text-label-sm">
														{getInitials(member.user.name, member.user.email)}
													</div>
												</Avatar.Image>
											)}
										</Avatar.Root>
									</motion.div>
									<motion.div
										{...getAnimationProps(index + 1, 1)}
										className="min-w-0 flex-1"
									>
										<div className="flex items-center gap-2">
											<span className="truncate font-medium text-label-sm text-text-strong-950">
												{member.user.name || member.user.email.split("@")[0]}
											</span>
											{isOwner && (
												<span className="text-warning-base">
													<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
														<path d="M5 16L3 8l5.5 5L12 4l3.5 9L21 8l-2 8H5zm2.7-2h8.6l.9-4.4L14 12l-2-6-2 6-2.2-2.4L7.7 14z" />
													</svg>
												</span>
											)}
										</div>
										<span className="truncate text-text-sub-600 text-xs">
											{member.user.email}
										</span>
									</motion.div>
								</div>

								{/* Role Column */}
								<div className="flex items-center px-4 py-3">
									<motion.div {...getAnimationProps(index + 1, 2)}>
										{isOwner ? (
											<span className={cn(
												"rounded-full px-2.5 py-1 font-medium text-xs",
												getRoleBadgeStyles(member.role)
											)}>
												{formatRoleLabel(member.role)}
											</span>
										) : (
											<Select.Root
												defaultValue={member.role}
												disabled={updatingRole === member.id}
												onValueChange={(value: "admin" | "member") =>
													handleRoleChange(member.id, value)
												}
											>
												<Select.Trigger className="h-7 w-[85px] text-xs">
													{updatingRole === member.id ? (
														<Spinner size={12} color="var(--text-sub-600)" />
													) : (
														<Select.Value />
													)}
												</Select.Trigger>
												<Select.Content>
													<Select.Item value="member">Member</Select.Item>
													<Select.Item value="admin">Admin</Select.Item>
												</Select.Content>
											</Select.Root>
										)}
									</motion.div>
								</div>

								{/* Joined Column */}
								<div className="flex items-center px-4 py-3">
									<motion.span
										{...getAnimationProps(index + 1, 3)}
										className="text-text-sub-600 text-xs"
									>
										{formatDate(member.createdAt)}
									</motion.span>
								</div>

								{/* Actions Column */}
								<div className="flex items-center justify-end px-4 py-3">
									{!isOwner && (
										<motion.div {...getAnimationProps(index + 1, 4)}>
											<Dropdown.Root>
												<Dropdown.Trigger asChild>
													<button
														type="button"
														className="flex h-8 w-8 items-center justify-center rounded-md text-text-sub-600 opacity-0 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 group-hover/row:opacity-100"
													>
														<Icon name="more-horizontal" className="h-4 w-4" />
													</button>
												</Dropdown.Trigger>
												<Dropdown.Content align="end" className="w-48">
													<Dropdown.Item
														className="text-error-base"
														onClick={() => handleRemoveMember(member.id)}
														disabled={removingMember === member.id}
													>
														{removingMember === member.id ? (
															<Spinner size={14} color="var(--error-base)" />
														) : (
															<Icon name="user-minus" className="h-4 w-4" />
														)}
														Remove Member
													</Dropdown.Item>
												</Dropdown.Content>
											</Dropdown.Root>
										</motion.div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</AnimatePresence>
	);
};
