import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Compact system / light / dark control for menus and headers. */
export function ThemeToggle({ subtle = false }: { subtle?: boolean } = {}) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Subtle: soft active pill instead of a solid white chip (dark menus).
	const activeClassName = subtle
		? "bg-bg-white-0 text-text-strong-950 shadow-sm dark:bg-white/[0.12] dark:text-white dark:shadow-none"
		: "bg-white text-black shadow-sm";

	return (
		<div className="inline-flex items-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
			<button
				type="button"
				onClick={() => setTheme("system")}
				className={`flex h-[21px] w-[21px] items-center justify-center rounded-full transition-all duration-200 ${
					mounted && theme === "system"
						? activeClassName
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
						? subtle
							? activeClassName
							: "bg-white text-black shadow-sm dark:bg-white dark:text-black"
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
						? activeClassName
						: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white/80"
				}`}
				aria-label="Dark mode"
			>
				<Icon className="size-3" name="moon" />
			</button>
		</div>
	);
}
