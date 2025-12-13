"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
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
			return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
		default:
			return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
	}
};

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
	<div className="flex items-center justify-between py-4">
		<div className="flex items-center gap-3">
			<Skeleton className="h-10 w-10 rounded-full" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-40" />
			</div>
		</div>
		<div className="flex items-center gap-8">
			<Skeleton className="h-6 w-16 rounded-full" />
			<Skeleton className="h-6 w-20 rounded-full" />
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
			const result = await authClient.organization.listInvitations({
				query: { organizationId: activeOrganization.id },
			});
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
			<div className="w-full text-paragraph-sm">
				{/* Header */}
				<div className="flex items-center gap-8 py-3 text-text-sub-600">
					<div className="flex flex-1 items-center gap-2">
						<Icon name="user" className="h-4 w-4" />
						<span className="text-sm">User</span>
					</div>
					<div className="flex w-24 items-center gap-2">
						<Icon name="shield" className="h-4 w-4" />
						<span className="text-sm">Role</span>
					</div>
					<div className="flex w-24 items-center gap-2">
						<Icon name="users" className="h-4 w-4" />
						<span className="text-sm">Teams</span>
					</div>
					<div className="w-32" />
				</div>
				{/* Skeleton rows */}
				<div className="space-y-1">
					{Array.from({ length: 3 }).map((_, index) => (
						<InviteSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-lighter">
					<Icon name="alert-circle" className="h-6 w-6 text-error-base" />
				</div>
				<p className="mt-4 font-medium text-text-strong-950">Failed to load invitations</p>
				<p className="mt-1 text-sm text-text-sub-600">Please try again later</p>
			</div>
		);
	}

	if (!invites || invites.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
					<Icon name="mail-single" className="h-6 w-6 text-text-sub-600" />
				</div>
				<p className="mt-4 font-medium text-text-strong-950">No pending invitations</p>
				<p className="mt-1 text-sm text-text-sub-600">Send an invitation to add team members</p>
			</div>
		);
	}

	return (
		<AnimatePresence mode="wait">
			<div className="w-full text-paragraph-sm">
				{/* Table Header */}
				<div className="flex items-center gap-8 py-3 text-text-sub-600">
					<div className="flex flex-1 items-center gap-2">
						<Icon name="user" className="h-4 w-4" />
						<span className="text-sm">User</span>
					</div>
					<div className="flex w-24 items-center gap-2">
						<Icon name="shield" className="h-4 w-4" />
						<span className="text-sm">Role</span>
					</div>
					<div className="flex w-24 items-center gap-2">
						<Icon name="users" className="h-4 w-4" />
						<span className="text-sm">Teams</span>
					</div>
					<div className="w-32" />
				</div>

				{/* Table Body */}
				<div className="space-y-1">
					{invites.map((invite, index) => {
						const isPending = invite.status.toLowerCase() === "pending";

						return (
							<div
								key={invite.id ? `invite-${invite.id}` : `invite-idx-${index}`}
								className={cn(
									"group/row flex items-center gap-8 rounded-lg py-4 transition-colors",
									"hover:bg-bg-weak-50/50"
								)}
							>
								{/* User Column */}
								<div className="flex flex-1 items-center gap-3">
									<motion.div
										{...getAnimationProps(index + 1, 0)}
										className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500"
									>
										<span className="font-medium text-white text-sm">?</span>
									</motion.div>
									<motion.div
										{...getAnimationProps(index + 1, 1)}
										className="min-w-0 flex-1"
									>
										<span className="truncate font-medium text-label-sm text-text-strong-950">
											{invite.email}
										</span>
									</motion.div>
								</div>

								{/* Role Column */}
								<div className="flex w-24 items-center">
									<motion.span
										{...getAnimationProps(index + 1, 2)}
										className={cn(
											"rounded-full px-2.5 py-1 text-xs font-medium",
											getRoleBadgeStyles(invite.role)
										)}
									>
										{getRoleLabel(invite.role)}
									</motion.span>
								</div>

								{/* Teams Column */}
								<div className="flex w-24 items-center">
									<motion.span
										{...getAnimationProps(index + 1, 3)}
										className="text-text-sub-600 text-xs"
									>
										—
									</motion.span>
								</div>

								{/* Status & Actions Column */}
								<div className="flex w-32 items-center justify-end gap-2">
									{isPending && (
										<motion.span
											{...getAnimationProps(index + 1, 4)}
											className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-xs text-text-sub-600"
										>
											Invite pendi...
										</motion.span>
									)}
									<motion.div {...getAnimationProps(index + 1, 5)}>
										<Dropdown.Root>
											<Dropdown.Trigger asChild>
												<button
													type="button"
													className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sub-600 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950"
												>
													<Icon name="more-vertical" className="h-4 w-4" />
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
													Cancel invitation
												</Dropdown.Item>
											</Dropdown.Content>
										</Dropdown.Root>
									</motion.div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</AnimatePresence>
	);
};
