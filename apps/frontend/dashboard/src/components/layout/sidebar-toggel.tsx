"use client";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

export const SidebarToggle = () => {
	const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();

	return (
		<div
			className="absolute z-50 shrink-0"
			style={{
				top: "14px",
				left: isSidebarCollapsed ? "67px" : "250px",
			}}
		>
			<Button.Root
				variant="neutral"
				mode="stroke"
				size="xxsmall"
				onClick={toggleSidebarCollapse}
				title="Toggle Sidebar (Cmd+B)"
				className={cn("-ml-[22px] absolute! z-10 h-5 w-5 rounded-md p-0")}
			>
				<Button.Icon>
					<Icon
						name={isSidebarCollapsed ? "chevron-right" : "chevron-left"}
						className="h-3.5 w-3.5"
					/>
				</Button.Icon>
			</Button.Root>
		</div>
	);
};
