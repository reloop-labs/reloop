import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { useSessionQuery } from "#/features/auth/session-query";
import { SidebarNavIcon } from "#/features/dashboard/sidebar/sidebar-nav-icon";
import { queryKeys } from "#/lib/query-keys";
import { UserAvatar } from "./user-avatar";

type Member = {
	id: string;
	role: string;
	user: {
		id: string;
		name: string | null;
		email: string;
		image?: string | null;
	};
};

/** Members shown inline before "View all" takes over. */
const PREVIEW_LIMIT = 5;

const SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

const ROW_CLASS =
	"group flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left font-medium text-[13px] text-text-sub-600 outline-none transition-colors duration-150 ease-out hover:bg-neutral-alpha-10 hover:text-text-strong-950 focus-visible:bg-neutral-alpha-10";

const primaryRole = (role: string) =>
	(role.split(",")[0] ?? role).trim().toLowerCase();

const formatRole = (role: string) =>
	primaryRole(role).replace(/^\w/, (c) => c.toUpperCase());

/**
 * One persistent side panel for the org switcher. It never closes between
 * rows: it glides to the hovered org (`top`) and grows/shrinks to fit the
 * new member list (`height`). Permissions come from the viewer's role in
 * the hovered org, read off its member list.
 */
export function OrgMembersFlyout({
	orgId,
	top = 0,
	inline = false,
	onNavigate,
	onPointerEnter,
}: {
	orgId: string;
	/** Offset from the top of the switcher panel, aligned to the hovered row. */
	top?: number;
	/** Touch: render in place of the org list instead of beside it. */
	inline?: boolean;
	/** Switches to this org first when it isn't active, then navigates. */
	onNavigate: (path: string) => void;
	onPointerEnter?: () => void;
}) {
	const { data: session } = useSessionQuery();
	const userId = session?.user?.id;
	const { data, isPending } = useQuery({
		queryKey: queryKeys.organization.members(orgId),
		queryFn: async (): Promise<{ members: Member[] }> => {
			const result = await authClient.organization.listMembers({
				query: { organizationId: orgId },
			});
			return (result.data as { members: Member[] }) ?? { members: [] };
		},
	});

	const members = data?.members ?? [];
	const preview = members.slice(0, PREVIEW_LIMIT);
	const hiddenCount = members.length - preview.length;

	const myRole = members.find((m) => m.user.id === userId)?.role;
	const role = myRole ? primaryRole(myRole) : null;
	// Teams page is owner/admin only (members are redirected away).
	const canManageTeam = role === "owner" || role === "admin";
	const canInvite =
		role === "owner" || role === "admin" || role === "member"
			? authClient.organization.checkRolePermission({
					role,
					permissions: { invitation: ["create"] },
				})
			: false;
	const hasActions = canInvite || canManageTeam;

	// Animate height to the measured content so swapping orgs never jumps.
	const contentRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | "auto">("auto");
	useLayoutEffect(() => {
		const el = contentRef.current;
		if (!el) return;
		const update = () => setHeight(el.offsetHeight);
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const body = (
		<div ref={contentRef} className={inline ? undefined : "p-1"}>
			<div className="flex items-center justify-between px-2.5 pt-1.5 pb-1.5">
				<span className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]">
					Members
				</span>
				{!isPending ? (
					<span className="font-medium text-[11px] text-text-soft-400 tabular-nums">
						{members.length}
					</span>
				) : null}
			</div>

			{isPending
				? Array.from({ length: 3 }, (_, i) => (
						<div key={i} className="flex h-11 items-center gap-2.5 px-2.5">
							<div className="size-6 shrink-0 animate-pulse rounded-full bg-bg-weak-50" />
							<div className="flex flex-1 flex-col gap-1">
								<div className="h-2.5 w-24 animate-pulse rounded bg-bg-weak-50" />
								<div className="h-2 w-32 animate-pulse rounded bg-bg-weak-50" />
							</div>
						</div>
					))
				: preview.map((member) => (
						<div
							key={member.id}
							className="flex h-11 items-center gap-2.5 px-2.5"
						>
							<UserAvatar
								name={member.user.name}
								email={member.user.email}
								image={member.user.image}
								size="24"
								className="shrink-0"
								initialsClassName="text-[10px]"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-[13px] text-text-strong-950 leading-4">
									{member.user.name || member.user.email}
								</p>
								{member.user.name ? (
									<p className="truncate text-[12px] text-text-soft-400 leading-4">
										{member.user.email}
									</p>
								) : null}
							</div>
							<span className="shrink-0 text-[11px] text-text-soft-400">
								{formatRole(member.role)}
							</span>
						</div>
					))}

			{hiddenCount > 0 ? (
				<p className="px-2.5 pt-0.5 pb-1.5 text-[12px] text-text-soft-400">
					+{hiddenCount} more
				</p>
			) : null}

			{hasActions ? (
				<div className="mx-2.5 my-1 h-px bg-stroke-soft-200" />
			) : null}

			{canInvite ? (
				<button
					type="button"
					className={ROW_CLASS}
					onClick={() => onNavigate("/settings/teams?modal=invite")}
				>
					<Icon name="plus" className="size-4 shrink-0 opacity-70" />
					Invite member
				</button>
			) : null}
			{canManageTeam ? (
				<button
					type="button"
					className={ROW_CLASS}
					onClick={() => onNavigate("/settings/teams")}
				>
					<SidebarNavIcon name="users" />
					View all members
				</button>
			) : null}
		</div>
	);

	if (inline) return body;

	return (
		<motion.div
			className="absolute left-[calc(100%+8px)] z-10 w-[280px] overflow-hidden rounded-xl bg-bg-white-0 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-weak-50"
			initial={{ opacity: 0, top, height, x: -4 }}
			animate={{ opacity: 1, top, height, x: 0 }}
			exit={{ opacity: 0, x: -4 }}
			transition={SPRING}
			onPointerEnter={onPointerEnter}
		>
			{body}
		</motion.div>
	);
}
