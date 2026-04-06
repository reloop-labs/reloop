"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { OrganizationSwitcher } from "../organization/organization-switcher";
import { SidebarItems } from "./sidebar-items";
import { UserMenuDropdown } from "./user-menu-dropdown";

interface MainSidebarProps {
	className?: string;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ className }) => {
	const { user, activeOrganization, push } = useUserOrganization();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
	const { refetch } = authClient.useSession();

	useEffect(() => {
		try {
			const saved = localStorage.getItem("isSidebarCollapsed");
			if (saved !== null) {
				setIsSidebarCollapsed(saved === "true");
			}
		} catch {}
	}, []);

	const toggleSidebarCollapse = () => {
		setIsSidebarCollapsed((prev) => {
			const next = !prev;
			try {
				localStorage.setItem("isSidebarCollapsed", String(next));
			} catch {}
			return next;
		});
	};

	useHotkeys("meta+b", (e) => {
		e.preventDefault();
		toggleSidebarCollapse();
	});

	const { data: organizations } = useSWR(
		"organizations",
		async () => (await authClient.organization.list()).data ?? undefined,
	);

	const handleOrganizationChange = async (organization: {
		id: string;
		name: string;
		slug: string;
	}) => {
		await authClient.updateUser({
			activeOrganizationId: organization.id,
		});
		refetch();
		push(organization.slug, true);
	};

	return (
		<motion.div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col border-stroke-soft-100 border-r bg-neutral-alpha-10/30 dark:border-stroke-soft-100/40",
				isSidebarCollapsed ? "w-14" : "w-60",
				className,
			)}
			animate={{ width: isSidebarCollapsed ? 56 : 240 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
		>
			{/* Header */}
			<div className="flex h-12 items-center justify-between border-stroke-soft-100 border-b dark:border-stroke-soft-100/40">
				<AnimatePresence mode="wait">
					{!isSidebarCollapsed && (
						<motion.div
							className="flex items-center gap-1"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ duration: 0.15 }}
						>
							<OrganizationSwitcher
								organizations={organizations}
								activeOrganization={activeOrganization}
								onOrganizationChange={handleOrganizationChange}
								isCollapsed={false}
								side="bottom"
							/>
						</motion.div>
					)}
				</AnimatePresence>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xxsmall"
					onClick={toggleSidebarCollapse}
					title="Toggle Sidebar (Cmd+B)"
					className={cn(
						isSidebarCollapsed && "ml-[18px]",
						"mr-3",
						"h-5 w-5 p-0",
						"bg-white",
					)}
				>
					<Button.Icon>
						<Icon
							name={isSidebarCollapsed ? "chevron-right" : "chevron-left"}
							className="h-3.5 w-3.5"
						/>
					</Button.Icon>
				</Button.Root>
			</div>

			{/* Main Navigation */}
			<div className="flex-1 overflow-y-auto p-2">
				<SidebarItems
					organizationSlug={activeOrganization.slug}
					isCollapsed={isSidebarCollapsed}
				/>
			</div>

			{/* User Menu */}
			<div className="border-stroke-soft-100 border-t p-2 dark:border-stroke-soft-100/40">
				<UserMenuDropdown
					user={user}
					organizationSlug={activeOrganization.slug}
					isCollapsed={isSidebarCollapsed}
				/>
			</div>
		</motion.div>
	);
};
