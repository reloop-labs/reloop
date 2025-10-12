"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	const themes = [
		{ value: "system", icon: "monitor", label: "System theme" },
		{ value: "light", icon: "sun", label: "Light theme" },
		{ value: "dark", icon: "moon", label: "Dark theme" },
	];

	return (
		<div className="flex w-fit items-center rounded-full border border-stroke-soft-200">
			{themes.map((themeOption) => (
				<motion.button
					key={themeOption.value}
					onClick={() => setTheme(themeOption.value)}
					className={cn(
						"flex size-6 items-center justify-center rounded-full transition-all duration-200 hover:text-text-900 dark:text-text-400 dark:hover:bg-gray-800 dark:hover:text-text-200",
						theme === "system" &&
							themeOption.value === "system" &&
							"border border-stroke-soft-200 bg-primary-600 text-white shadow-sm",
						theme === "light" &&
							themeOption.value === "light" &&
							"border border-stroke-soft-200 bg-white text-text-strong-950 shadow-sm",
						theme === "dark" &&
							themeOption.value === "dark" &&
							"border border-stroke-soft-200 bg-black text-white shadow-sm",
					)}
					title={themeOption.label}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Icon name={themeOption.icon} className="w-3.5" />
				</motion.button>
			))}
		</div>
	);
}
