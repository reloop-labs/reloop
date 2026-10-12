import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useSessionQuery } from "#/features/auth/session-query";
import { PixelAvatarTile } from "#/features/dashboard/page-header/pixel-avatar";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { queryKeys } from "#/lib/query-keys";
import {
	dedupePendingInvitesByEmail,
	isInvitationActionable,
	isInvitationExpiredPending,
	isInvitationPending,
} from "#/utils/invitations";

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
	filters?: TeamFilterValue;
	/** Opens the invite modal prefilled with the given email. */
	onInvite?: (email: string) => void;
}

const getRoleBadgeStyles = (role: string) => {
	switch (role.toLowerCase()) {
		case "owner":
			return "border border-bg-strong-950 bg-bg-strong-950 text-text-white-0";
		case "admin":
			return "border border-stroke-sub-300 bg-bg-white-0 text-text-strong-950 dark:border-white/20 dark:bg-transparent";
		default:
			return "border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/[0.04]";
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

const isEmailLike = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const primaryRole = (role: string) =>
	role.split(",")[0]?.trim().toLowerCase() ?? role.toLowerCase();

const GRID = "grid-cols-[minmax(0,1fr)_120px_130px_32px]";

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
		<div className="flex items-center justify-center">
			<Skeleton className="h-4 w-4 rounded" />
		</div>
	</div>
);

const TableHeader = () => (
	<div
		className={`grid ${GRID} items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40`}
	>
		<div className="flex items-center gap-1">
			<Icon name="user" className="h-3 w-3" />
			<span className="text-xs">User</span>
		</div>
		<div className="flex items-center gap-1">
			<Icon name="user-role" className="h-3 w-3" />
			<span className="text-xs">Role</span>
		</div>
		<div className="flex items-center gap-1">
			<Icon name="activity" className="h-3 w-3" />
			<span className="text-xs">Status</span>
		</div>
		<div />
	</div>
);

import { type AssignableRole, ChangeRoleModal } from "./change-role-modal";
import { InviteDropdown } from "./invite-dropdown";
import { MemberDropdown } from "./member-dropdown";
import { RemoveMemberModal } from "./remove-member-modal";
import { RevokeInviteModal } from "./revoke-invite-modal";
import type { TeamFilterValue } from "./team-filter-dropdown";

export function TeamList({
	searchQuery,
	filters = "all",
	onInvite,
}: TeamListProps) {
	const queryClient = useQueryClient();
	const { activeOrganization } = useActiveOrganization();
	const { canManageTeam, isOwner } = useOrgPermissions();
	const [removingMember, setRemovingMember] = useState<string | null>(null);
	const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);
	const [resendingInvite, setResendingInvite] = useState<string | null>(null);
	const [updatingRole, setUpdatingRole] = useState(false);
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
	const [changeRoleModalOpen, setChangeRoleModalOpen] = useState(false);
	const [memberToChangeRole, setMemberToChangeRole] = useState<Member | null>(
		null,
	);
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const orgId = activeOrganization?.id;

	const { data: membersData, isPending: membersLoading } = useQuery({
		queryKey: queryKeys.organization.members(orgId ?? ""),
		queryFn: async (): Promise<{ members: Member[] }> => {
			if (!orgId) return { members: [] };
			const result = await authClient.organization.listMembers({
				query: { organizationId: orgId },
			});
			return (result.data as { members: Member[] }) ?? { members: [] };
		},
		enabled: !!orgId,
	});

	const { data: invites, isPending: invitesLoading } = useQuery({
		queryKey: queryKeys.organization.invitations(orgId ?? ""),
		queryFn: async (): Promise<Invite[]> => {
			if (!orgId) return [];
			const result = await authClient.organization.listInvitations({
				query: { organizationId: orgId },
			});
			return (result.data as Invite[]) ?? [];
		},
		enabled: !!orgId,
	});

	const invalidateMembers = () =>
		queryClient.invalidateQueries({
			queryKey: queryKeys.organization.members(orgId ?? ""),
		});
	const invalidateInvites = () =>
		queryClient.invalidateQueries({
			queryKey: queryKeys.organization.invitations(orgId ?? ""),
		});

	const { data: session } = useSessionQuery();
	const currentUserId = session?.user?.id;

	// Filter based on search query and filter type
	const filteredData = useMemo(() => {
		const members = membersData?.members ?? [];
		// Deduplicate pending invites by email so an expired row + a re-invite
		// never appear as two separate people in the team list.
		const pendingInvites = dedupePendingInvitesByEmail(
			(invites ?? []).filter((i) => isInvitationPending(i)),
		);

		let filteredMembers = members;
		let filteredInvites = pendingInvites;

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filteredMembers = filteredMembers.filter(
				(m) =>
					m.user.email.toLowerCase().includes(query) ||
					m.user.name?.toLowerCase().includes(query),
			);
			filteredInvites = filteredInvites.filter((i) =>
				i.email.toLowerCase().includes(query),
			);
		}

		// Apply status filter (single-select)
		if (filters === "active") filteredInvites = [];
		if (filters === "invited") filteredMembers = [];

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
			if (error) throw new Error(error.message || "Failed to remove member");
			await invalidateMembers();
			toast.success("Member removed");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to remove member",
			);
			throw err;
		} finally {
			setRemovingMember(null);
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

	/**
	 * Whether the current user can change this member's role.
	 * - Owners/admins manage the team
	 * - Owner role is fixed (cannot reassign here)
	 * - You cannot change your own role
	 * - Only owners can demote other admins (admins cannot update owners anyway)
	 */
	const canChangeMemberRole = (member: Member) => {
		if (!canManageTeam) return false;
		if (member.user.id === currentUserId) return false;
		const role = primaryRole(member.role);
		if (role === "owner") return false;
		if (role === "admin" && !isOwner) return false;
		return true;
	};

	const handleChangeRoleClick = (memberId: string) => {
		const member = membersData?.members?.find((m) => m.id === memberId);
		if (!member) return;
		setMemberToChangeRole(member);
		setChangeRoleModalOpen(true);
	};

	const handleRemoveMemberById = (memberId: string) => {
		const member = membersData?.members?.find((m) => m.id === memberId);
		if (!member) return;
		handleRemoveMemberClick(member);
	};

	const handleConfirmChangeRole = async (role: AssignableRole) => {
		const member = memberToChangeRole;
		if (!member || !activeOrganization?.id) return false;
		if (primaryRole(member.role) === role) return true;

		setUpdatingRole(true);
		try {
			const { error } = await authClient.organization.updateMemberRole({
				memberId: member.id,
				role,
				organizationId: activeOrganization.id,
			});
			if (error) {
				toast.error(error.message || "Failed to update role");
				return false;
			}
			await invalidateMembers();
			toast.success(`Role changed to ${formatRoleLabel(role)}`);
			return true;
		} catch {
			toast.error("Failed to update role");
			return false;
		} finally {
			setUpdatingRole(false);
		}
	};

	const handleCancelInvite = async (invitationId: string) => {
		setCancellingInvite(invitationId);
		try {
			const { error } = await authClient.organization.cancelInvitation({
				invitationId,
			});
			if (error)
				throw new Error(error.message || "Failed to cancel invitation");
			await invalidateInvites();
			toast.success("Invitation revoked");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to cancel invitation",
			);
			throw err;
		} finally {
			setCancellingInvite(null);
		}
	};

	const handleResendInvite = async (inviteId: string) => {
		const invite = invites?.find((i) => i.id === inviteId);
		if (!invite || !activeOrganization?.id) return;

		setResendingInvite(inviteId);
		try {
			// Better Auth only matches *non-expired* pending invites for `resend: true`.
			// Expired rows stay `status: "pending"`, so a naive resend inserts a second
			// pending invite for the same email. Cancel every pending invite for that
			// email first, then create a fresh one.
			const sameEmailPending = (invites ?? []).filter(
				(i) =>
					isInvitationPending(i) &&
					i.email.toLowerCase() === invite.email.toLowerCase(),
			);

			await Promise.all(
				sameEmailPending.map((i) =>
					authClient.organization.cancelInvitation({ invitationId: i.id }),
				),
			);

			const { error } = await authClient.organization.inviteMember({
				email: invite.email,
				role: invite.role as "admin" | "member",
				organizationId: activeOrganization.id,
			});
			if (error) {
				toast.error(error.message || "Failed to resend invitation");
				// Refresh so canceled rows don't leave the UI empty if create failed.
				await invalidateInvites();
				return;
			}
			await invalidateInvites();
			toast.success(`Invite resent to ${invite.email}`);
		} catch (_err) {
			toast.error("Failed to resend invitation");
			await invalidateInvites();
		} finally {
			setResendingInvite(null);
		}
	};

	const handleCopyInviteLink = (inviteId: string) => {
		const inviteLink = `${window.location.origin}/dashboard/invite?id=${inviteId}`;
		navigator.clipboard.writeText(inviteLink).then(
			() => toast.success("Invite link copied"),
			() => toast.error("Couldn't copy the invite link"),
		);
	};

	const handleRevokeInviteClick = (inviteId: string) => {
		setModal("revoke-invite");
		setInviteId(inviteId);
	};

	const inviteToRevoke = invites?.find((i) => i.id === inviteId) ?? null;

	const handleConfirmRevoke = async () => {
		if (!inviteToRevoke) return;
		await handleCancelInvite(inviteToRevoke.id);
	};

	const isLoading = membersLoading || invitesLoading || !membersData;

	if (isLoading) {
		return (
			<div className="w-full text-paragraph-sm">
				<TableHeader />
				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100 dark:border-stroke-soft-100/70 dark:bg-black">
					{Array.from({ length: 3 }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
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
			<div className="w-full text-paragraph-sm">
				<TableHeader />

				{/* Table body, stacked over header with rounded corners (same as domains) */}
				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100 dark:border-stroke-soft-100/70 dark:bg-black">
					{noResults ? (
						<div className="flex flex-col items-center justify-center py-16">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
								<Icon
									name={searchQuery || filters !== "all" ? "search" : "users"}
									className="h-6 w-6 text-text-sub-600"
								/>
							</div>
							<p className="mt-4 max-w-full truncate px-4 font-medium text-text-strong-950">
								{searchQuery
									? `No results for “${searchQuery.trim()}”`
									: filters === "invited"
										? "No pending invites"
										: "No team members yet"}
							</p>
							<p className="mt-1 text-sm text-text-sub-600">
								{searchQuery
									? onInvite
										? isEmailLike(searchQuery.trim())
											? "They're not on your team yet. Send them an invite."
											: "Not on your team yet. Invite them by email."
										: "Try a different search term"
									: filters === "invited"
										? "Invites you send will show up here"
										: "Invite members to get started"}
							</p>
							{searchQuery.trim() && onInvite ? (
								<FancyButton.Root
									variant="neutral"
									size="small"
									className="mt-5 max-w-full rounded-full font-medium"
									onClick={() => onInvite(searchQuery.trim())}
								>
									<FancyButton.Icon as={Icon} name="user-plus" />
									<span className="max-w-[260px] truncate">
										Invite {searchQuery.trim()}
									</span>
								</FancyButton.Root>
							) : null}
						</div>
					) : (
						<>
							{/* Pending Invites */}
							{filteredData.invites.map((invite, index) => {
								const expired = isInvitationExpiredPending(invite);
								const actionable = isInvitationActionable(invite);
								const rowId = invite.id
									? `invite-${invite.id}`
									: `invite-idx-${index}`;
								const isRowActive = activeDropdownId === rowId;

								return (
									<div
										key={rowId}
										className={cn(
											`group/row grid ${GRID} items-center px-4 py-2 text-left transition-colors`,
											"hover:bg-bg-weak-50 dark:hover:bg-white/[0.04]",
											isRowActive && "bg-bg-weak-50 dark:bg-white/[0.04]",
										)}
									>
										{/* User Column */}
										<div className="flex min-w-0 items-center gap-3">
											<PixelAvatarTile
												seed={invite.email}
												className="h-6 w-6"
											/>
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
											<span
												className={cn(
													"h-1.5 w-1.5 flex-shrink-0 rounded-full",
													expired ? "bg-error-base" : "bg-amber-400",
												)}
											/>
											<span className="font-medium text-[12px] text-text-sub-600">
												{expired ? "Invite Expired" : "Invite Pending"}
											</span>
										</div>

										{/* Actions Column */}
										<div className="flex items-center justify-center text-text-soft-400">
											<InviteDropdown
												inviteId={invite.id}
												onResendInvite={handleResendInvite}
												onCopyInviteLink={
													actionable ? handleCopyInviteLink : undefined
												}
												onRevokeInvite={handleRevokeInviteClick}
												isResending={resendingInvite === invite.id}
												onOpenChange={(open) =>
													setActiveDropdownId(open ? rowId : null)
												}
											/>
										</div>
									</div>
								);
							})}

							{/* Members */}
							{filteredData.members.map((member, index) => {
								const memberIsOwner = primaryRole(member.role) === "owner";
								const isCurrentUser = member.user.id === currentUserId;
								const canEditRole = canChangeMemberRole(member);
								const rowId =
									member.id && member.id.length > 0
										? `member-${member.id}`
										: `member-idx-${index}`;
								const isRowActive = activeDropdownId === rowId;

								return (
									<div
										key={rowId}
										className={cn(
											`group/row grid ${GRID} items-center px-4 py-2 text-left transition-colors`,
											"hover:bg-bg-weak-50 dark:hover:bg-white/[0.04]",
											isRowActive && "bg-bg-weak-50 dark:bg-white/[0.04]",
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
														<div className="h-full w-full overflow-hidden rounded-full bg-bg-weak-50">
															<PixelAvatarTile
																seed={member.user.email}
																className="h-full w-full"
															/>
														</div>
													</Avatar.Image>
												)}
											</Avatar.Root>
											<div className="min-w-0 flex-1">
												<div className="flex min-w-0 items-center gap-1.5">
													<span className="truncate font-medium text-label-sm text-text-strong-950">
														{member.user.name ||
															member.user.email.split("@")[0]}
													</span>
													{isCurrentUser && (
														<span className="inline-flex flex-shrink-0 items-center rounded-full border border-stroke-soft-200 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 leading-none dark:border-white/10">
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
												{formatRoleLabel(primaryRole(member.role))}
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
										<div className="flex items-center justify-center text-text-soft-400">
											{!memberIsOwner && !isCurrentUser && canManageTeam && (
												<MemberDropdown
													memberId={member.id}
													canChangeRole={canEditRole}
													onChangeRole={handleChangeRoleClick}
													onRemove={handleRemoveMemberById}
													onOpenChange={(open) =>
														setActiveDropdownId(open ? rowId : null)
													}
												/>
											)}
										</div>
									</div>
								);
							})}
						</>
					)}
				</div>
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
			<ChangeRoleModal
				open={changeRoleModalOpen}
				onOpenChange={(open) => {
					setChangeRoleModalOpen(open);
					if (!open) setMemberToChangeRole(null);
				}}
				onConfirm={handleConfirmChangeRole}
				isUpdating={updatingRole}
				memberName={memberToChangeRole?.user.name ?? ""}
				memberEmail={memberToChangeRole?.user.email ?? ""}
				currentRole={
					memberToChangeRole ? primaryRole(memberToChangeRole.role) : "member"
				}
			/>
		</div>
	);
}
