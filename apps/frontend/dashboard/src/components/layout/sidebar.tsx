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
			<div className="flex h-12 items-center justify-between pr-3 pl-1">
				<OrganizationSwitcher
					organizations={organizations}
					activeOrganization={activeOrganization}
					onOrganizationChange={handleOrganizationChange}
					isCollapsed={isSidebarCollapsed}
					side="bottom"
				/>
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				<SidebarItems isCollapsed={isSidebarCollapsed} />
			</div>
			<div className="mx-3 my-3">
				<UserMenuDropdown user={user} isCollapsed={isSidebarCollapsed} />
			</div>
		</div>
	);
};
