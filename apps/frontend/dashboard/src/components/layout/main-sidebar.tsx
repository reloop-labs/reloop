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
import useSWR from "swr";
import {
	MainNavigation,
	OrganizationSwitcher,
	UserMenuDropdown,
} from "./sidebar";

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
				"sticky top-0 z-10 flex h-screen flex-col border-stroke-soft-100 border-r bg-neutral-alpha-10/30",
				isSidebarCollapsed ? "w-14" : "w-60",
				className,
			)}
			animate={{ width: isSidebarCollapsed ? 56 : 240 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
		>
			{/* Header */}
			<div className="flex h-12 items-center border-stroke-soft-100 border-b px-2">
				{activeOrganization ? (
					<div>
						<Avatar.Root size="24" placeholderType="company">
							{activeOrganization.logo && (
								<Avatar.Image
									src={activeOrganization.logo}
									alt={activeOrganization.name}
								/>
							)}
						</Avatar.Root>
					</div>
				) : (
					<Logo className="h-8 w-8 rounded-full" />
				)}

				<AnimatePresence mode="wait">
					{!isSidebarCollapsed && (
						<motion.div
							className="flex items-center gap-1"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							transition={{ duration: 0.15 }}
						>
							<p className="ml-1 text-text-disabled-300">/</p>
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
					mode="ghost"
					size="xxsmall"
					onClick={toggleSidebarCollapse}
					className={cn(isSidebarCollapsed && "absolute -right-4.5 ", "ml-auto")}
				>
					<Button.Icon>
						<Icon
							name={isSidebarCollapsed ? "arrow-right-rec" : "arrow-left-rec"}
						/>
					</Button.Icon>
				</Button.Root>
			</div>

			{/* Main Navigation */}
			<div className="flex-1 overflow-y-auto p-2">
				<MainNavigation
					organizationSlug={activeOrganization.slug}
					isCollapsed={isSidebarCollapsed}
				/>
			</div>

			{/* User Menu */}
			<div className="border-stroke-soft-100 border-t p-2">
				<UserMenuDropdown
					user={user}
					organizationSlug={activeOrganization.slug}
					isCollapsed={isSidebarCollapsed}
				/>
			</div>
		</motion.div>
	);
};
