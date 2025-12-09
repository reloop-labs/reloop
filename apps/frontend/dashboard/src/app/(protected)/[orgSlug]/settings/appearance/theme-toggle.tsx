"use client";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";
import { SidebarLayoutIcon } from "./sidebar-layout-icon";

export function ThemeToggleAppearance() {
	const { theme, setTheme } = useTheme();
	const themeOptions = [
		{
			value: "light",
			label: "Light",
			icon: "sun",
			image: "/dashboard/ui-light.png",
			layoutIcon: <SidebarLayoutIcon variant="light" />,
		},
		{
			value: "dark",
			label: "Dark",
			icon: "moon",
			image: "/dashboard/ui-dark.png",
			layoutIcon: <SidebarLayoutIcon variant="dark" />,
		},
		{
			value: "system",
			label: "System",
			icon: "monitor",
			image: "/dashboard/ui-system.png",
			layoutIcon: <SidebarLayoutIcon variant="auto" />,
		},
	];

	return (
		<div className="flex gap-2">
			{themeOptions.map((option) => (
				<button
					type="button"
					key={option.value}
					onClick={() => setTheme(option.value)}
					className={cn(
						"rounded-xl border px-3 pt-2 pb-2.5 transition-all duration-200",
						theme === option.value
							? "border-primary-500 bg-primary-50"
							: "border-stroke-soft-100 hover:border-stroke-soft-200",
					)}
				>
					{option.layoutIcon}
					<div className="flex items-center justify-center gap-2 pt-2">
						<Icon
							name={option.icon}
							className={cn(
								"h-4 w-4",
								theme === option.value
									? "text-primary-600"
									: "text-text-sub-600",
							)}
						/>
						<p className={cn("text-sm", "font-medium text-primary-600")}>
							{option.label}
						</p>
					</div>
				</button>
			))}
		</div>
	);
}
