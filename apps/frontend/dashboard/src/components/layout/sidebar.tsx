"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR, { useSWRConfig } from "swr";
import { OrganizationSwitcher } from "./organization-switcher";
import { SidebarItems } from "./sidebar-items";
import { UserMenuDropdown } from "./user-menu-dropdown";

export const MainSidebar: React.FC = () => {
	const { mutate } = useSWRConfig();
	const { user, activeOrganization } = useUserOrganization();
	const router = useRouter();
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
		try {
			await authClient.organization.setActive({
				organizationId: organization.id,
			});
			await authClient.updateUser({
				activeOrganizationId: organization.id,
			});
			await refetch();
			await mutate(() => true, undefined, { revalidate: true });
			router.refresh();
		} catch (error) {
			console.error("Error switching organization:", error);
		}
	};

	return (
		<div
			className={cn(
				"sticky top-0 z-10 flex h-screen flex-col transition-[width] duration-200 ease-in-out",
				isSidebarCollapsed ? "w-14" : "w-60",
			)}
		>
			<div
				className={cn(
					"flex items-center justify-between transition-all",
					isSidebarCollapsed ? "h-14 px-0 justify-center" : "h-12 pr-3 pl-1"
				)}
			>
				<OrganizationSwitcher
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={handleOrganizationChange}
					isCollapsed={isSidebarCollapsed}
					side="bottom"
				/>
			</div>
			<div
				className={cn(
					"flex-1 overflow-y-auto transition-all py-2",
					isSidebarCollapsed ? "px-0" : "px-2"
				)}
			>
				<SidebarItems isCollapsed={isSidebarCollapsed} />
			</div>
			<div
				className={cn(
					"my-3 transition-all flex justify-center w-full",
					isSidebarCollapsed ? "px-0" : "px-3"
				)}
			>
				<UserMenuDropdown user={user} isCollapsed={isSidebarCollapsed} />
			</div>
		</div>
	);
};
