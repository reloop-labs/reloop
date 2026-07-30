"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Light / dark control for the links landing poster.
 * Renders a stable placeholder until mounted to avoid hydration mismatch.
 */
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted && resolvedTheme === "dark";

	return (
		<button
			type="button"
			className="links-poster-theme-toggle links-poster-mono"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			title={isDark ? "Light mode" : "Dark mode"}
		>
			<span className="links-poster-theme-toggle-icon" aria-hidden>
				{!mounted ? "○" : isDark ? "☀" : "☾"}
			</span>
			<span className="links-poster-theme-toggle-label">
				{!mounted ? "THEME" : isDark ? "LIGHT" : "DARK"}
			</span>
		</button>
	);
}
