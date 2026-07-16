import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Compact system / light / dark control for menus and headers. */
export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
			<button
				type="button"
				onClick={() => setTheme("system")}
				className={`flex h-[21px] w-[21px] items-center justify-center rounded-full transition-all duration-200 ${
					mounted && theme === "system"
						? "bg-white text-black shadow-sm"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
				}`}
				aria-label="System theme"
			>
				<Icon className="size-3" name="laptop" />
			</button>
			<button
				type="button"
				onClick={() => setTheme("light")}
				className={`flex h-[21px] w-[21px] items-center justify-center rounded-full transition-all duration-200 ${
					mounted && theme === "light"
						? "bg-white text-black shadow-sm dark:bg-white dark:text-black"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
				}`}
				aria-label="Light mode"
			>
				<Icon className="size-3" name="sun" />
			</button>
			<button
				type="button"
				onClick={() => setTheme("dark")}
				className={`flex h-[21px] w-[21px] items-center justify-center rounded-full transition-all duration-200 ${
					mounted && theme === "dark"
						? "bg-white text-black shadow-sm"
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
				}`}
				aria-label="Dark mode"
			>
				<Icon className="size-3" name="moon" />
			</button>
		</div>
	);
}
