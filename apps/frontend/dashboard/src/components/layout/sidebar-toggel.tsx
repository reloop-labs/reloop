"use client";
import { useUIStore } from "@fe/dashboard/store/use-ui-store";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "motion/react";

export const SidebarToggle = () => {
	const { isSidebarCollapsed, toggleSidebarCollapse } = useUIStore();

	return (
		<motion.div
			className="absolute z-50 shrink-0"
			style={{ top: "12px" }}
			animate={{ left: isSidebarCollapsed ? 67 : 235 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
		>
			<Button.Root
				variant="neutral"
				mode="ghost"
				size="xxsmall"
				onClick={toggleSidebarCollapse}
				title="Toggle Sidebar (Cmd+B)"
				className={cn("-ml-[22px] absolute! z-10 h-5 w-5 rounded-md p-0")}
			>
				<Button.Icon>
					<Icon
						name="sidebar-left"
						className="h-3.5 w-3.5 transition-transform duration-200"
						style={{
							transform: isSidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)",
						}}
					/>
				</Button.Icon>
			</Button.Root>
		</motion.div>
	);
};
