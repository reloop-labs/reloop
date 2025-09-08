"use client";

import { Root as Badge } from "@reloop/ui/components/badge";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import { Logo } from "@reloop/ui/components/logo";
import { cn } from "@reloop/ui/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi } from "../../lib/api";

interface SidebarItem {
	id: string;
	label: string;
	href: string;
	iconName: string;
	badge?: string;
	children?: SidebarItem[];
}

const getSidebarItems = (userCount: number | null): SidebarItem[] => [
	{
		id: "dashboard",
		label: "Dashboard",
		href: "/",
		iconName: "home",
	},
	{
		id: "users",
		label: "Users",
		href: "/users",
		iconName: "users",
		badge: userCount !== null ? userCount.toString() : undefined,
		// children: [
		// 	{
		// 		id: "all-users",
		// 		label: "All Users",
		// 		href: "/users/all",
		// 		iconName: "user-square",
		// 	},
		// 	{
		// 		id: "user-groups",
		// 		label: "User Groups",
		// 		href: "/users/groups",
		// 		iconName: "users",
		// 	},
		// 	{
		// 		id: "permissions",
		// 		label: "Permissions",
		// 		href: "/users/permissions",
		// 		iconName: "shield",
		// 	},
		// ],
	},
];

interface SidebarItemProps {
	item: SidebarItem;
	isCollapsed: boolean;
	isActive: boolean;
	level?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
	item,
	isCollapsed,
	isActive,
	level = 0,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const hasChildren = item.children && item.children.length > 0;

	const handleClick = () => {
		if (hasChildren) {
			setIsExpanded(!isExpanded);
		}
	};
	return (
		<div>
			<Link href={item.href}>
				<Button.Root
					variant="neutral"
					mode={isActive ? "filled" : "ghost"}
					className={cn(
						"h-10 w-full justify-start gap-3 px-3 text-left",
						level > 0 && "ml-4 h-8 text-sm",
						isCollapsed && "justify-center px-2",
					)}
					onClick={handleClick}
					size="xsmall"
				>
					<Icon
						name={item.iconName}
						className={cn("h-4 w-4 flex-shrink-0", level > 0 && "h-3 w-3")}
					/>
					{!isCollapsed && (
						<>
							<span className="flex-1 truncate">{item.label}</span>
							{item.badge && (
								<Badge
									variant="filled"
									color="gray"
									size="small"
									className="ml-auto"
								>
									{item.badge}
								</Badge>
							)}
							{hasChildren && (
								<Icon
									name="chevron-right"
									className={cn(
										"h-3 w-3 transition-transform",
										isExpanded && "rotate-90",
									)}
								/>
							)}
						</>
					)}
				</Button.Root>
			</Link>

			{hasChildren && !isCollapsed && isExpanded && (
				<div className="mt-1 space-y-1">
					{item.children?.map((child) => (
						<SidebarItem
							key={child.id}
							item={child}
							isCollapsed={isCollapsed}
							isActive={false}
							level={level + 1}
						/>
					))}
				</div>
			)}
		</div>
	);
};

const Sidebar = () => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [userCount, setUserCount] = useState<number | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		const fetchUserCount = async () => {
			try {
				const { data, error } = await (authApi as any)["stats/users"].get();
				if (!error && data) {
					setUserCount(data.totalUsers);
				}
			} catch (error) {
				console.error("Failed to fetch user count:", error);
			}
		};

		fetchUserCount();
	}, []);

	const isActive = (href: string) => {
		if (href === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(href);
	};

	return (
		<aside
			className={cn(
				"flex flex-col border-gray-800 border-r bg-gray-900 transition-all duration-300",
				isCollapsed ? "w-16" : "w-64",
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-gray-800 p-4">
				{!isCollapsed && (
					<div className="flex items-center gap-3">
						<Logo className="h-10 w-10 rounded-full lg:h-10 lg:w-10" />
						<div className="flex flex-col">
							<Link href="/" className="font-semibold text-white">
								Reloop
							</Link>
						</div>
						<Icon name="chevron-down" className="h-4 w-4 text-gray-400" />
					</div>
				)}
				<Button.Root
					variant="neutral"
					mode="ghost"
					size="small"
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="h-10 w-10 flex-shrink-0 p-0 text-gray-400 hover:text-white"
				>
					{isCollapsed ? (
						<Icon name="chevron-right" className="h-4 w-4" />
					) : (
						<Icon name="chevron-left" className="h-4 w-4" />
					)}
				</Button.Root>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-2 overflow-y-auto p-4">
				{getSidebarItems(userCount).map((item) => (
					<SidebarItem
						key={item.id}
						item={item}
						isCollapsed={isCollapsed}
						isActive={isActive(item.href)}
					/>
				))}
			</nav>

			{/* Footer */}
			{!isCollapsed && (
				<div className="border-gray-800 border-t p-4">
					<div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
						<Logo className="h-10 w-10 rounded-full lg:h-10 lg:w-10" />
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-sm text-white">Twinkal</p>
							<p className="truncate text-gray-400 text-xs">
								twinkal_admin@reloop.sh
							</p>
						</div>
						<Icon name="chevron-down" className="h-4 w-4 text-gray-400" />
					</div>
				</div>
			)}
		</aside>
	);
};

export default Sidebar;
