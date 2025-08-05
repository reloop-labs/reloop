"use client";

import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import { useTheme } from "next-themes";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button.Root
			size="xsmall"
			mode="stroke"
			variant="neutral"
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
		>
			<Icon name={theme === "light" ? "moon" : "sun"} className="w-4" />
		</Button.Root>
	);
}
