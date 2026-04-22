"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { OrganizationSwitcher } from "./organization-switcher";
import { SidebarItems } from "./sidebar-items";
import { UserMenuDropdown } from "./user-menu-dropdown";

interface MainSidebarProps {
	className?: string;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ className }) => {
	const { user, activeOrganization, push } = useUserOrganization();
	const { isSidebarCollapsed, setIsSidebarCollapsed, toggleSidebarCollapse } =
		useUIStore();
	const { refetch } = authClient.useSession();

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
			<div className="flex h-12 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-1 dark:border-stroke-soft-100/40">
				<OrganizationSwitcher
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={handleOrganizationChange}
					isCollapsed={false}
					side="bottom"
				/>
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				<SidebarItems isCollapsed={isSidebarCollapsed} />
			</div>
			<div className="border-stroke-soft-100 border-t p-2 dark:border-stroke-soft-100/40">
				<UserMenuDropdown user={user} isCollapsed={isSidebarCollapsed} />
			</div>
		</motion.div>
	);
};
