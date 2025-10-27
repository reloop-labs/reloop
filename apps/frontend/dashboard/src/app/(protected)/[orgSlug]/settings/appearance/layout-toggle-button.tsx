"use client";

import { useLayout } from "@fe/dashboard/providers/layout-provider";
import { cn } from "@reloop/ui/cn";
import { SidebarLayoutIcon } from "./sidebar-layout-icon";
import { TopbarLayoutIcon } from "./topbar-layout-icon";

interface LayoutToggleButtonProps {
	className?: string;
}

export const LayoutToggleButton: React.FC<LayoutToggleButtonProps> = ({
	className,
}) => {
	const { layoutMode, setLayoutMode } = useLayout();

	const layoutOptions = [
		{
			value: "sidebar",
			label: "Sidebar",
			icon: SidebarLayoutIcon,
		},
		{
			value: "topbar",
			label: "Topbar",
			icon: TopbarLayoutIcon,
		},
	];

	return (
		<div className={cn("flex gap-2", className)}>
			{layoutOptions.map((option) => (
				<button
					type="button"
					key={option.value}
					onClick={() => setLayoutMode(option.value as "sidebar" | "topbar")}
					className={cn(
						"rounded-xl border px-3 pt-2 pb-2.5 transition-all duration-200",
						layoutMode === option.value
							? "border-primary-500 bg-primary-50"
							: "border-stroke-soft-100 hover:border-stroke-soft-200",
					)}
				>
					<p className={cn("text-sm", "font-medium text-primary-600")}>
						{option.label}
					</p>
					<div className="flex items-center justify-center gap-2 pt-2">
						<option.icon defaultSystemTheme />
					</div>
				</button>
			))}
		</div>
	);
};
