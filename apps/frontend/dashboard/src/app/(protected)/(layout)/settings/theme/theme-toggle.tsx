"use client";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SidebarLayoutIcon } from "./sidebar-layout-icon";

export function ThemeToggleAppearance() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

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
			icon: "laptop",
			image: "/dashboard/ui-system.png",
			layoutIcon: <SidebarLayoutIcon variant="auto" />,
		},
	];

	return (
		<div className="grid w-full max-w-[500px] grid-cols-1 gap-3 sm:grid-cols-3">
			{themeOptions.map((option) => {
				const isActive = mounted && theme === option.value;
				return (
					<button
						type="button"
						key={option.value}
						onClick={() => setTheme(option.value)}
						className={cn(
							"group flex flex-col overflow-hidden rounded-[14px] border-[1.5px] text-left transition-all",
							isActive
								? "border-text-main-900 dark:border-white"
								: "border-stroke-soft-100 hover:border-stroke-soft-200 dark:border-stroke-soft-100/50 dark:hover:border-stroke-soft-100",
						)}
					>
						<div className="flex w-full flex-1 items-end justify-center bg-bg-soft-200/30 px-4 pt-5 pb-5">
							<div className="flex w-full justify-center opacity-90 transition-opacity group-hover:opacity-100 [&>svg]:h-auto [&>svg]:w-full [&>svg]:max-w-[90px]">
								{option.layoutIcon}
							</div>
						</div>

						<div className="flex w-full items-center justify-between border-stroke-soft-100 border-t bg-background px-3.5 py-2.5 dark:border-stroke-soft-100/50">
							<div className="flex items-center gap-2">
								<Icon
									name={option.icon}
									className={cn(
										"h-4 w-4",
										isActive
											? "text-text-main-900 dark:text-white"
											: "text-text-sub-500",
									)}
								/>
								<p
									className={cn(
										"font-medium text-[13px]",
										isActive
											? "text-text-main-900 dark:text-white"
											: "text-text-sub-600",
									)}
								>
									{option.label}
								</p>
							</div>

							{option.value === "system" ? (
								<div className="rounded-full bg-[#0A438A] px-1.5 py-0.5 font-medium text-[10px] text-white dark:bg-[#1E57A8]">
									Auto
								</div>
							) : (
								<div
									className={cn(
										"flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px]",
										isActive
											? "border-text-main-900 dark:border-white"
											: "border-stroke-sub-300 dark:border-stroke-soft-500",
									)}
								>
									{isActive && (
										<div className="h-1.5 w-1.5 rounded-full bg-black bg-text-main-900 dark:bg-white" />
									)}
								</div>
							)}
						</div>
					</button>
				);
			})}
		</div>
	);
}
