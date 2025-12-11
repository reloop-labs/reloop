"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
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
  filters?: ("invited" | "suspended" | "active")[];
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

const getFirstChar = (name: string | null, email: string) => {
  if (name && name.length > 0) {
    return name.charAt(0).toUpperCase();
  }
  const emailPart = email.split("@")[0];
  if (!emailPart) return "?";
  return emailPart.charAt(0).toUpperCase();
};

const getRoleBadgeStyles = (role: string) => {
  switch (role.toLowerCase()) {
    case "owner":
      return "border border-primary-base text-primary-base bg-primary-base/20";
    case "admin":
      return "border border-violet-500 text-violet-400 bg-violet-500/20";
    default:
      return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
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

const TeamSkeleton = () => (
  <div className="grid grid-cols-[1fr_180px_165px] items-center py-2 px-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-6 w-6 rounded-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
    <div className="flex items-center justify-end">
      <Skeleton className="h-4 w-4 rounded" />
    </div>
  </div>
);

import { InviteDropdown } from "./invite-dropdown";

export const TeamList = ({ searchQuery, filters = [] }: TeamListProps) => {
  const { activeOrganization } = useUserOrganization();
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);

  // Fetch members
  const { data: membersData, isLoading: membersLoading, mutate: mutateMembers } = useSWR<{ members: Member[] }>(
    `organization-member-${activeOrganization.id}`,
    async () => {
      const result = await authClient.organization.listMembers({});
      return result.data ?? { members: [] };
    },
  );

  // Fetch invites
  const { data: invites, isLoading: invitesLoading, mutate: mutateInvites } = useSWR<Invite[]>(
    `invitations-${activeOrganization.id}`,
    async () => {
      const result = await authClient.organization.listInvitations();
      return result.data ?? [];
    },
  );

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Filter based on search query and filter type
  const filteredData = useMemo(() => {
    const members = membersData?.members ?? [];
    const pendingInvites = (invites ?? []).filter(i => i.status.toLowerCase() === "pending");

    let filteredMembers = members;
    let filteredInvites = pendingInvites;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredMembers = filteredMembers.filter(
        (m) =>
          m.user.email.toLowerCase().includes(query) ||
          (m.user.name && m.user.name.toLowerCase().includes(query))
      );
      filteredInvites = filteredInvites.filter(
        (i) => i.email.toLowerCase().includes(query)
      );
    }

    // Apply type filter (multi-select)
    if (filters.length > 0) {
      const showInvited = filters.includes("invited");
      const showSuspended = filters.includes("suspended");
      const showActive = filters.includes("active");

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

    return { members: filteredMembers, invites: filteredInvites };
  }, [membersData, invites, searchQuery, filters]);

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
    }
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

  const isLoading = membersLoading || invitesLoading;

  if (isLoading) {
    return (
      <div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_180px_165px] items-center py-2 px-4 text-text-sub-600 border-b border-stroke-soft-200 bg-bg-weak-50">
          <div className="flex items-center gap-2">
            <Icon name="user" className="h-4 w-4" />
            <span className="text-xs">User</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="user-role" className="h-4 w-4" />
            <span className="text-xs">Role</span>
          </div>
          <div />
        </div>
        {/* Skeleton rows */}
        <div className="divide-y divide-stroke-soft-200">
          {Array.from({ length: 3 }).map((_, index) => (
            <TeamSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  const noResults = filteredData.members.length === 0 && filteredData.invites.length === 0;

  if (noResults && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
          <Icon name="search" className="h-6 w-6 text-text-sub-600" />
        </div>
        <p className="mt-4 font-medium text-text-strong-950">No results found</p>
        <p className="mt-1 text-sm text-text-sub-600">Try a different search term</p>
      </div>
    );
  }

  if (noResults) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
          <Icon name="users" className="h-6 w-6 text-text-sub-600" />
        </div>
        <p className="mt-4 font-medium text-text-strong-950">No team members yet</p>
        <p className="mt-1 text-sm text-text-sub-600">Invite members to get started</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="w-full text-paragraph-sm rounded-xl border border-stroke-soft-100 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_180px_165px] items-center py-3.5 px-4 text-text-sub-600 border-b border-stroke-soft-100">
          <div className="flex items-center gap-2">
            <Icon name="user" className="h-4 w-4" />
            <span className="text-xs">User</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="user-role" className="h-4 w-4" />
            <span className="text-xs">Role</span>
          </div>
          <div />
        </div>

        {/* Combined List */}
        <div className="divide-y divide-stroke-soft-100">
          {/* Pending Invites */}
          {filteredData.invites.map((invite, index) => (
            <div
              key={`invite-${invite.id}`}
              className={cn(
                "group/row grid grid-cols-[1fr_180px_165px] items-center py-2 px-4 transition-colors",
                "hover:bg-bg-weak-50/50"
              )}
            >
              {/* User Column - Avatar + Email */}
              <motion.div
                {...getAnimationProps(index + 1, 0)}
                className="flex items-center gap-3"
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white text-xs uppercase tracking-wide shadow-sm">
                  {invite.email.charAt(0).toUpperCase()}
                </div>

                <span className="truncate font-medium text-label-sm text-text-sub-600">
                  {invite.email}
                </span>
              </motion.div>

              {/* Role Column */}
              <motion.div {...getAnimationProps(index + 1, 1)} className="flex items-center">
                <span className={cn(
                  "inline-flex rounded-md px-[6px] py-0.5 text-[10px] font-medium border-[1px] border-stroke-soft-200",
                  getRoleBadgeStyles(invite.role)
                )}>
                  {formatRoleLabel(invite.role)}
                </span>
              </motion.div>

              {/* Actions Column */}
              <motion.div {...getAnimationProps(index + 1, 2)} className="flex items-center justify-end gap-8">
                <span className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 py-1 text-xs text-text-sub-600">
                  Invite pending...
                </span>
                <InviteDropdown
                  inviteId={invite.id}
                  onCancelInvite={handleCancelInvite}
                  isCancelling={cancellingInvite === invite.id}
                />
              </motion.div>
            </div>
          ))}

          {/* Members */}
          {filteredData.members.map((member, index) => {
            const isOwner = member.role.toLowerCase() === "owner";
            const isCurrentUser = member.user.id === currentUserId;
            const displayIndex = index + filteredData.invites.length;

            return (
              <div
                key={`member-${member.id}`}
                className={cn(
                  "group/row grid grid-cols-[1fr_180px_165px] items-center py-2 px-4 transition-colors",
                  "hover:bg-bg-weak-50/50"
                )}
              >
                {/* User Column - Avatar + Name + Email */}
                <motion.div
                  {...getAnimationProps(displayIndex + 1, 0)}
                  className="flex items-center gap-3"
                >
                  <Avatar.Root size="20" color="gray">
                    {member.user.image ? (
                      <Avatar.Image src={member.user.image} alt={member.user.name || member.user.email} />
                    ) : (
                      <Avatar.Image asChild>
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white text-xs uppercase tracking-wide shadow-sm">
                          {getFirstChar(member.user.name, member.user.email)}
                        </div>
                      </Avatar.Image>
                    )}
                  </Avatar.Root>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium text-label-sm text-text-strong-950">
                        {member.user.name || member.user.email.split("@")[0]}
                      </span>
                      {isCurrentUser && (
                        <span className="text-text-sub-600">(You)</span>
                      )}
                      <span className="truncate text-text-sub-600 ">
                        {member.user.email}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Role Column */}
                <motion.div {...getAnimationProps(displayIndex + 1, 1)} className="flex items-center">
                  <span className={cn(
                    "inline-flex rounded-md px-[6px] py-0.5 text-[10px] font-medium border-[1px] border-stroke-soft-200",
                    getRoleBadgeStyles(member.role)
                  )}>
                    {formatRoleLabel(member.role)}
                  </span>
                </motion.div>

                {/* Actions Column */}
                <motion.div
                  {...getAnimationProps(displayIndex + 1, 2)}
                  className="flex items-center justify-end"
                >
                  {!isOwner && !isCurrentUser && (
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
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removingMember === member.id}
                        >
                          {removingMember === member.id ? (
                            <Spinner size={14} color="var(--error-base)" />
                          ) : (
                            <Icon name="user-minus" className="h-4 w-4" />
                          )}
                          Remove from organization
                        </Dropdown.Item>
                      </Dropdown.Content>
                    </Dropdown.Root>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatePresence >
  );
};
