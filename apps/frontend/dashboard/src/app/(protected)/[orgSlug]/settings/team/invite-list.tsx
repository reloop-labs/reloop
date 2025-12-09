"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import * as StatusBadge from "@reloop/ui/status-badge";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface Invite {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: Date;
	inviterId: string;
}

const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
};

const getStatusBadgeProps = (status: string) => {
	switch (status.toLowerCase()) {
		case "pending":
			return { status: "pending" as const, variant: "light" as const };
		case "accepted":
			return { status: "completed" as const, variant: "light" as const };
		case "expired":
		case "declined":
			return { status: "failed" as const, variant: "light" as const };
		default:
			return { status: "disabled" as const, variant: "stroke" as const };
	}
};

const getRoleLabel = (role: string) => {
	switch (role.toLowerCase()) {
		case "admin":
			return "Admin";
		case "member":
			return "Member";
		case "owner":
			return "Owner";
		default:
			return role;
	}
};

const getRoleBadgeStyles = (role: string) => {
	switch (role.toLowerCase()) {
		case "admin":
			return "bg-primary-lighter text-primary-base";
		default:
			return "bg-bg-weak-50 text-text-sub-600";
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

const InviteSkeleton = () => (
	<div className="grid grid-cols-[1fr_80px_100px_100px_80px]">
		<div className="flex items-center gap-3 px-4 py-3">
			<Skeleton className="h-9 w-9 rounded-full" />
			<Skeleton className="h-4 w-40" />
		</div>
		<div className="flex items-center px-4 py-3">
			<Skeleton className="h-5 w-14 rounded-full" />
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

export const InviteList = () => {
	const { activeOrganization } = useUserOrganization();
	const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);

	const {
		data: invites,
		isLoading,
		error,
		mutate,
	} = useSWR<Invite[]>(
		`invitations-${activeOrganization.id}`,
		async () => {
			const result = await authClient.organization.listInvitations();
			return result.data ?? [];
		},
	);

	const handleCancelInvite = async (invitationId: string) => {
		setCancellingInvite(invitationId);
		try {
			const { error } = await authClient.organization.cancelInvitation({
				invitationId,
			});
			if (error) {
				toast.error(error.message || "Failed to cancel invitation");
				return;
			}
			toast.success("Invitation cancelled");
			mutate();
		} catch (err) {
			toast.error("Failed to cancel invitation");
		} finally {
			setCancellingInvite(null);
		}
	};

	if (isLoading) {
		return (
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_80px_100px_100px_80px] border-b border-stroke-soft-200 bg-bg-weak-50">
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Email
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Role
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Status
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Expires
					</div>
					<div className="px-4 py-3" />
				</div>
				{/* Skeleton Rows */}
				<div className="divide-y divide-stroke-soft-200">
					{Array.from({ length: 3 }).map((_, index) => (
						<InviteSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 py-12">
				<Icon name="alert-circle" className="mb-3 h-8 w-8 text-error-base" />
				<p className="font-medium text-text-strong-950">Failed to load invitations</p>
				<p className="text-paragraph-sm text-text-sub-600">Please try again later</p>
			</div>
		);
	}

	if (!invites || invites.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 py-12">
				<Icon name="mail" className="mb-3 h-8 w-8 text-text-sub-600" />
				<p className="font-medium text-text-strong-950">No pending invitations</p>
				<p className="text-paragraph-sm text-text-sub-600">All invitations have been processed</p>
			</div>
		);
	}

	return (
		<AnimatePresence mode="wait">
			<div className="w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-paragraph-sm">
				{/* Table Header */}
				<div className="grid grid-cols-[1fr_80px_100px_100px_80px] border-b border-stroke-soft-200 bg-bg-weak-50">
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Email
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Role
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Status
					</div>
					<div className="px-4 py-3 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Expires
					</div>
					<div className="px-4 py-3" />
				</div>

				{/* Table Body */}
				<div className="divide-y divide-stroke-soft-200">
					{invites.map((invite, index) => {
						const statusProps = getStatusBadgeProps(invite.status);
						const isPending = invite.status.toLowerCase() === "pending";

						return (
							<div
								key={invite.id || index}
								className={cn(
									"group/row grid grid-cols-[1fr_80px_100px_100px_80px] transition-colors",
									"hover:bg-bg-weak-50/50"
								)}
							>
								{/* Email Column */}
								<div className="flex items-center gap-3 px-4 py-3">
									<motion.div
										{...getAnimationProps(index + 1, 0)}
										className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-bg-weak-50 ring-1 ring-stroke-soft-200"
									>
										<Icon name="mail" className="h-4 w-4 text-text-sub-600" />
									</motion.div>
									<motion.span
										{...getAnimationProps(index + 1, 1)}
										className="truncate font-medium text-label-sm text-text-strong-950"
									>
										{invite.email}
									</motion.span>
								</div>

								{/* Role Column */}
								<div className="flex items-center px-4 py-3">
									<motion.span
										{...getAnimationProps(index + 1, 2)}
										className={cn(
											"rounded-full px-2 py-0.5 font-medium text-xs",
											getRoleBadgeStyles(invite.role)
										)}
									>
										{getRoleLabel(invite.role)}
									</motion.span>
								</div>

								{/* Status Column */}
								<div className="flex items-center px-4 py-3">
									<motion.div {...getAnimationProps(index + 1, 3)}>
										<StatusBadge.Root {...statusProps}>
											{invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
										</StatusBadge.Root>
									</motion.div>
								</div>

								{/* Expires Column */}
								<div className="flex items-center px-4 py-3">
									<motion.span
										{...getAnimationProps(index + 1, 4)}
										className="text-text-sub-600 text-xs"
									>
										{formatDate(invite.expiresAt)}
									</motion.span>
								</div>

								{/* Actions Column */}
								<div className="flex items-center justify-end px-4 py-3">
									{isPending && (
										<motion.div {...getAnimationProps(index + 1, 5)}>
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
														onClick={() => handleCancelInvite(invite.id)}
														disabled={cancellingInvite === invite.id}
													>
														{cancellingInvite === invite.id ? (
															<Spinner size={14} color="var(--error-base)" />
														) : (
															<Icon name="x-close" className="h-4 w-4" />
														)}
														Cancel Invitation
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
