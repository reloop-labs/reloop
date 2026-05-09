"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
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

interface Invite {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: Date;
	inviterId: string;
}

interface TeamListProps {
	searchQuery: string;
	filters?: "invited" | "suspended" | "active" | "all";
}

const getRoleBadgeStyles = (role: string) => {
	switch (role.toLowerCase()) {
		case "owner":
			return "border border-warning-light bg-warning-lighter text-warning-base";
		case "admin":
			return "border border-feature-light bg-feature-lighter text-feature-base";
		default:
			return "border border-neutral-alpha-10 bg-neutral-alpha-10 text-text-sub-600";
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

const GRID = "grid-cols-[minmax(0,1fr)_100px_130px_32px]";
const BORDER = "border-stroke-soft-100 dark:border-stroke-soft-100/50";
const DIVIDER = "divide-stroke-soft-100 dark:divide-stroke-soft-100/50";

const TeamSkeleton = () => (
	<div className={`grid ${GRID} items-center px-4 py-2`}>
		<div className="flex items-center gap-3">
			<Skeleton className="h-6 w-6 flex-shrink-0 rounded-full" />
			<div className="space-y-1.5">
				<Skeleton className="h-3.5 w-24" />
				<Skeleton className="h-3 w-32" />
			</div>
		</div>
		<Skeleton className="h-5 w-16 rounded-full" />
		<div className="flex items-center gap-2">
			<Skeleton className="h-2 w-2 rounded-full" />
			<Skeleton className="h-3 w-24" />
		</div>
		<Skeleton className="h-4 w-4 rounded" />
	</div>
);

import { InviteDropdown } from "./invite-dropdown";
import { RemoveMemberModal } from "./remove-member-modal";
import { RevokeInviteModal } from "./revoke-invite-modal";

export const TeamList = ({ searchQuery, filters = "all" }: TeamListProps) => {
	const { activeOrganization } = useUserOrganization();
	const [removingMember, setRemovingMember] = useState<string | null>(null);
	const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);
	const [resendingInvite, setResendingInvite] = useState<string | null>(null);
	const [modal, setModal] = useQueryState("modal", { history: "replace" });
	const [inviteId, setInviteId] = useQueryState("inviteId", {
		history: "replace",
	});
	const [removeMemberModalOpen, setRemoveMemberModalOpen] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<{
		id: string;
		name: string | null;
		email: string;
	} | null>(null);

	// Fetch members
	const {
		data: membersData,
		isLoading: membersLoading,
		mutate: mutateMembers,
	} = useSWR<{ members: Member[] }>(
		activeOrganization?.id
			? `organization-member-${activeOrganization.id}`
			: null,
		async () => {
			if (!activeOrganization?.id) return { members: [] };
			const result = await authClient.organization.listMembers({
				query: { organizationId: activeOrganization.id },
			});
			return result.data ?? { members: [] };
		},
	);

	// Fetch invites
	const {
		data: invites,
		isLoading: invitesLoading,
		mutate: mutateInvites,
	} = useSWR<Invite[]>(
		activeOrganization?.id ? `invitations-${activeOrganization.id}` : null,
		async () => {
			if (!activeOrganization?.id) return [];
			const result = await authClient.organization.listInvitations({
				query: { organizationId: activeOrganization.id },
			});
			return result.data ?? [];
		},
	);

	const { data: session } = authClient.useSession();
	const currentUserId = session?.user?.id;

	// Filter based on search query and filter type
	const filteredData = useMemo(() => {
		const members = membersData?.members ?? [];
		const pendingInvites = (invites ?? []).filter(
			(i) => i.status.toLowerCase() === "pending",
		);

		let filteredMembers = members;
		let filteredInvites = pendingInvites;

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filteredMembers = filteredMembers.filter(
				(m) =>
					m.user.email.toLowerCase().includes(query) ||
					(m.user.name && m.user.name.toLowerCase().includes(query)),
			);
			filteredInvites = filteredInvites.filter((i) =>
				i.email.toLowerCase().includes(query),
			);
		}

		// Apply type filter (single-select)
		if (filters !== "all") {
			const showInvited = filters === "invited";
			const showSuspended = filters === "suspended";
			const showActive = filters === "active";

			// If only specific filters are selected, filter accordingly
			if (!showInvited) {
				filteredInvites = [];
			}
			if (!showActive && !showSuspended) {
				filteredMembers = [];
			} else if (showSuspended && !showActive) {
				// TODO: Filter by suspended status when available
				filteredMembers = [];
			} else if (showActive && !showSuspended) {
				// Show only active members
				// filteredMembers already contains all members
			}
		}

		// Ensure current user is always at the top
		const sortedMembers = [...filteredMembers].sort((a, b) => {
			if (a.user.id === currentUserId) return -1;
			if (b.user.id === currentUserId) return 1;
			return 0;
		});

		return { members: sortedMembers, invites: filteredInvites };
	}, [membersData, invites, searchQuery, filters, currentUserId]);

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
			mutateMembers();
		} catch (err) {
			toast.error("Failed to remove member");
		} finally {
			setRemovingMember(null);
			setRemoveMemberModalOpen(false);
			setMemberToRemove(null);
		}
	};

	const handleRemoveMemberClick = (member: Member) => {
		setMemberToRemove({
			id: member.id,
			name: member.user.name,
			email: member.user.email,
		});
		setRemoveMemberModalOpen(true);
	};

	const handleConfirmRemoveMember = async () => {
		if (!memberToRemove) return;
		await handleRemoveMember(memberToRemove.id);
	};

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
			mutateInvites();
		} catch (err) {
			toast.error("Failed to cancel invitation");
		} finally {
			setCancellingInvite(null);
		}
	};

	const handleResendInvite = async (inviteId: string) => {
		const invite = invites?.find((i) => i.id === inviteId);
		if (!invite) return;

		setResendingInvite(inviteId);
		try {
			const { error } = await authClient.organization.inviteMember({
				email: invite.email,
				role: invite.role as "admin" | "member",
				organizationId: activeOrganization?.id ?? "",
				resend: true,
			});
			if (error) {
				toast.error(error.message || "Failed to resend invitation");
				return;
			}
			toast.success("Invitation resent successfully");
			mutateInvites();
		} catch (err) {
			toast.error("Failed to resend invitation");
		} finally {
			setResendingInvite(null);
		}
	};

	const handleCopyInviteLink = (inviteId: string) => {
		const inviteLink = `${window.location.origin}/dashboard/accept-invitation?id=${inviteId}`;
		navigator.clipboard.writeText(inviteLink);
		toast.success("Invite link copied to clipboard");
	};

	const handleRevokeInviteClick = (inviteId: string) => {
		setModal("revoke-invite");
		setInviteId(inviteId);
	};

	const inviteToRevoke = invites?.find((i) => i.id === inviteId) ?? null;

	const handleConfirmRevoke = async () => {
		if (!inviteToRevoke) return;
		await handleCancelInvite(inviteToRevoke.id);
		setModal(null);
		setInviteId(null);
	};

	const isLoading = membersLoading || invitesLoading || !membersData;

	if (isLoading) {
		return (
			<div
				className={`w-full overflow-hidden rounded-xl border text-paragraph-sm ${BORDER}`}
			>
				<div
					className={`grid ${GRID} items-center border-b bg-bg-weak-50/50 px-4 py-2.5 text-text-sub-600 dark:bg-bg-weak-50/40 ${BORDER}`}
				>
					<div className="flex items-center gap-1">
						<Icon name="user" className="h-3 w-3" />
						<span className="font-medium text-xs tracking-wide">User</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="user-role" className="h-3 w-3" />
						<span className="font-medium text-xs tracking-wide">Role</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="activity" className="h-3 w-3" />
						<span className="font-medium text-xs tracking-wide">Status</span>
					</div>
					<div />
				</div>
				<div className={`divide-y ${DIVIDER}`}>
					{Array.from({ length: 3 }).map((_, index) => (
						<TeamSkeleton key={`skeleton-${index}`} />
					))}
				</div>
			</div>
		);
	}

	const noResults =
		filteredData.members.length === 0 && filteredData.invites.length === 0;

	return (
		<div>
			<div
				className={`w-full overflow-hidden rounded-xl border text-paragraph-sm ${BORDER}`}
			>
				<div
					className={`grid ${GRID} items-center border-b bg-bg-weak-50/50 px-4 py-2.5 text-text-sub-600 dark:bg-bg-weak-50/40 ${BORDER}`}
				>
					<div className="flex items-center gap-1">
						<Icon name="user" className="h-3 w-3" />
						<span className="font-medium text-xs tracking-wide">User</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="user-role" className="h-3 w-3" />
						<span className="font-medium text-xs tracking-wide">Role</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="activity" className="h-3 w-3" />
						<span className="font-medium text-xs tracking-wide">Status</span>
					</div>
					<div />
				</div>

				{/* Combined List or Empty State */}
				{noResults ? (
					<div className="flex flex-col items-center justify-center py-16">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
							<Icon
								name={searchQuery ? "search" : "users"}
								className="h-6 w-6 text-text-sub-600"
							/>
						</div>
						<p className="mt-4 font-medium text-text-strong-950">
							{searchQuery ? "No results found" : "No team members yet"}
						</p>
						<p className="mt-1 text-sm text-text-sub-600">
							{searchQuery
								? "Try a different search term"
								: "Invite members to get started"}
						</p>
					</div>
				) : (
					<div className={`divide-y ${DIVIDER}`}>
						{/* Pending Invites */}
						{filteredData.invites.map((invite, index) => (
							<div
								key={
									invite.id && invite.id.length > 0
										? `invite-${invite.id}`
										: `invite-idx-${index}`
								}
								className={cn(
									`group/row grid ${GRID} items-center px-4 py-2 transition-colors`,
									"hover:bg-bg-weak-50/50",
								)}
							>
								{/* User Column */}
								<div className="flex min-w-0 items-center gap-3">
									<div
										className={cn(
											"flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
											getAvatarGradient(invite.email),
										)}
									>
										{getAvatarInitial(null, invite.email)}
									</div>
									<div className="min-w-0">
										<span className="block truncate font-medium text-label-sm text-text-strong-950">
											{invite.email.split("@")[0]}
										</span>
										<span className="block truncate text-[11px] text-text-sub-600">
											{invite.email}
										</span>
									</div>
								</div>

								{/* Role Column */}
								<div className="flex items-center">
									<span
										className={cn(
											"inline-flex rounded-full px-2.5 py-0.5 font-medium text-[11px]",
											getRoleBadgeStyles(invite.role),
										)}
									>
										{formatRoleLabel(invite.role)}
									</span>
								</div>

								{/* Status Column */}
								<div className="flex items-center gap-2">
									<span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
									<span className="font-medium text-[12px] text-text-sub-600">
										Invite Pending
									</span>
								</div>

								{/* Actions Column */}
								<div className="flex items-center justify-end">
									<InviteDropdown
										inviteId={invite.id}
										onResendInvite={handleResendInvite}
										onCopyInviteLink={handleCopyInviteLink}
										onRevokeInvite={handleRevokeInviteClick}
										isResending={resendingInvite === invite.id}
									/>
								</div>
							</div>
						))}

						{/* Members */}
						{filteredData.members.map((member, index) => {
							const isOwner = member.role.toLowerCase() === "owner";
							const isCurrentUser = member.user.id === currentUserId;

							return (
								<div
									key={
										member.id && member.id.length > 0
											? `member-${member.id}`
											: `member-idx-${index}`
									}
									className={cn(
										`group/row grid ${GRID} items-center px-4 py-2 transition-colors`,
										"hover:bg-bg-weak-50/50",
										isCurrentUser && "bg-bg-weak-50/40",
									)}
								>
									{/* User Column */}
									<div className="flex min-w-0 items-center gap-3">
										<Avatar.Root
											size="24"
											color="gray"
											className="flex-shrink-0"
										>
											{member.user.image ? (
												<Avatar.Image
													src={member.user.image}
													alt={member.user.name || member.user.email}
												/>
											) : (
												<Avatar.Image asChild>
													<div
														className={cn(
															"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
															getAvatarGradient(member.user.email),
														)}
													>
														{getAvatarInitial(
															member.user.name,
															member.user.email,
														)}
													</div>
												</Avatar.Image>
											)}
										</Avatar.Root>
										<div className="min-w-0 flex-1">
											<div className="flex min-w-0 items-center gap-1.5">
												<span className="truncate font-medium text-label-sm text-text-strong-950">
													{member.user.name || member.user.email.split("@")[0]}
												</span>
												{isCurrentUser && (
													<span className="inline-flex flex-shrink-0 items-center rounded-full bg-primary-base px-1.5 py-0.5 font-bold text-[9px] text-white uppercase leading-none tracking-wider">
														You
													</span>
												)}
											</div>
											<span className="block truncate text-[11px] text-text-sub-600">
												{member.user.email}
											</span>
										</div>
									</div>

									{/* Role Column */}
									<div className="flex items-center">
										<span
											className={cn(
												"inline-flex rounded-full px-2.5 py-0.5 font-medium text-[11px]",
												getRoleBadgeStyles(member.role),
											)}
										>
											{formatRoleLabel(member.role)}
										</span>
									</div>

									{/* Status Column */}
									<div className="flex items-center gap-2">
										<span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success-base" />
										<span className="font-medium text-[12px] text-text-sub-600">
											Active
										</span>
									</div>

									{/* Actions Column */}
									<div className="flex items-center justify-end">
										{!isOwner && !isCurrentUser && (
											<Dropdown.Root>
												<Dropdown.Trigger asChild>
													<Button.Root
														variant="neutral"
														mode="ghost"
														size="xxsmall"
													>
														<Icon name="more-horizontal" className="h-3 w-3" />
													</Button.Root>
												</Dropdown.Trigger>
												<Dropdown.Content align="end" className="w-52 text-xs">
													<Dropdown.Item
														className="text-error-base"
														onClick={() => handleRemoveMemberClick(member)}
													>
														<Icon name="user-minus" className="h-3 w-3" />
														Remove from organization
													</Dropdown.Item>
												</Dropdown.Content>
											</Dropdown.Root>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
			<RevokeInviteModal
				open={modal === "revoke-invite"}
				onOpenChange={(open) => {
					if (!open) {
						setModal(null);
						setInviteId(null);
					}
				}}
				onConfirm={handleConfirmRevoke}
				isRevoking={cancellingInvite === inviteToRevoke?.id}
				inviteEmail={inviteToRevoke?.email ?? ""}
				inviteRole={inviteToRevoke?.role ?? "member"}
				invitedAt={
					(inviteToRevoke as unknown as { createdAt?: Date })?.createdAt
				}
			/>
			<RemoveMemberModal
				open={removeMemberModalOpen}
				onOpenChange={setRemoveMemberModalOpen}
				onConfirm={handleConfirmRemoveMember}
				isRemoving={removingMember === memberToRemove?.id}
				memberName={memberToRemove?.name ?? ""}
				memberEmail={memberToRemove?.email ?? ""}
			/>
		</div>
	);
};
