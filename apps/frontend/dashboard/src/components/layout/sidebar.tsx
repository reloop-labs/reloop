"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { InviteFriendsModal } from "./invite-friends-modal";
import { ReferFriendsBanner } from "./refer-friends-banner";
import { SidebarItems } from "./sidebar-items";
import { UserMenuDropdown } from "./user-menu-dropdown";

export const MainSidebar: React.FC = () => {
	const { user } = useUserOrganization();
	const { isSidebarCollapsed, setIsSidebarCollapsed, toggleSidebarCollapse } =
		useUIStore();
	const [inviteOpen, setInviteOpen] = useState(false);

	useEffect(() => {
		try {
			const saved = localStorage.getItem("isSidebarCollapsed");
			if (saved !== null) {
				setIsSidebarCollapsed(saved === "true");
			}
		} catch {}
	}, [setIsSidebarCollapsed]);

	useHotkeys("meta+b", (e) => {
		e.preventDefault();
		toggleSidebarCollapse();
	});

	return (
		<div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col transition-[width] duration-200 ease-in-out",
				isSidebarCollapsed ? "w-14" : "w-60",
			)}
		>
			<div
				className={cn(
					"flex items-center transition-all",
					isSidebarCollapsed
						? "h-14 w-full justify-center px-0"
						: "h-12 justify-between pr-3 pl-3",
				)}
			>
				{isSidebarCollapsed ? (
					<div className="relative flex h-full w-full items-center justify-center">
						<Logo className="h-8 w-8 shrink-0" />
						<button
							type="button"
							onClick={toggleSidebarCollapse}
							title="Toggle Sidebar (Cmd+B)"
							className="-translate-y-1/2 -right-2.5 absolute top-1/2 z-20 flex h-5 w-5 shrink-0 items-center justify-center text-text-sub-600 transition-colors hover:text-text-strong-950"
						>
							<Icon
								name="sidebar-left"
								className="h-3 w-3 transition-transform duration-200"
								style={{
									transform: "rotate(180deg)",
								}}
							/>
						</button>
					</div>
				) : (
					<>
						<div className="flex items-center gap-2">
							<Logo className="w-10" />
							<p className="-ml-2 font-semibold text-text-strong-950">Reloop</p>
						</div>
						<button
							type="button"
							onClick={toggleSidebarCollapse}
							title="Toggle Sidebar (Cmd+B)"
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
						>
							<Icon
								name="sidebar-left"
								className="h-4 w-4 transition-transform duration-200"
								style={{
									transform: "rotate(0deg)",
								}}
							/>
						</button>
					</>
				)}
			</div>
			<div
				className={cn(
					"flex-1 overflow-y-auto py-2 transition-all",
					isSidebarCollapsed ? "px-0" : "px-2",
				)}
			>
				<SidebarItems isCollapsed={isSidebarCollapsed} />
			</div>
			<div
				className={cn(
					"mt-1 mb-3 flex w-full flex-col items-center justify-center gap-1.5 transition-all",
					isSidebarCollapsed ? "px-0" : "px-3",
				)}
			>
				<ReferFriendsBanner
					isCollapsed={isSidebarCollapsed}
					onInvite={() => setInviteOpen(true)}
				/>
				<UserMenuDropdown
					user={user}
					isCollapsed={isSidebarCollapsed}
					onInviteFriends={() => setInviteOpen(true)}
				/>
			</div>
			<InviteFriendsModal open={inviteOpen} onOpenChange={setInviteOpen} />
		</div>
	);
};
