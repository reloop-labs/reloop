"use client";

import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import { mainNavigation, userNavigation } from "@fe/dashboard/constants";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export const PageHeader = () => {
	const { orgSlug } = useParams();
	const pathname = usePathname();
	const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();

	const pathWithoutSlug = pathname.replace(/^\/[^/]+/, "") || "/";
	const activeItem = [...mainNavigation, ...userNavigation].find((item) => {
		if (item.path === "/") return pathWithoutSlug === "/";
		return pathWithoutSlug.startsWith(item.path);
	});

	if (!activeItem) return null;

	const href = `/${orgSlug}${activeItem.path}`;

	return (
		<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 pr-2 pl-3 dark:border-stroke-soft-100/40">
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xxsmall"
						onClick={toggleSidebarCollapse}
						title="Toggle Sidebar (Cmd+B)"
						className={cn("-ml-[22px] h-5 w-5 rounded-md p-0")}
					>
						<Button.Icon>
							<Icon
								name={isSidebarCollapsed ? "chevron-right" : "chevron-left"}
								className="h-3.5 w-3.5"
							/>
						</Button.Icon>
					</Button.Root>
					<Link
						href={href}
						className={Button.buttonVariants({
							variant: "neutral",
							mode: "ghost",
							size: "xxsmall",
						}).root()}
					>
						<Icon
							name={
								activeItem.iconName as React.ComponentProps<typeof Icon>["name"]
							}
							className="h-4 w-4"
						/>
						<span className="font-medium text-sm">{activeItem.label}</span>
					</Link>
				</div>
				<div className="flex items-center justify-end">
					<FeedbackPopover />
				</div>
			</div>
		</div>
	);
};
