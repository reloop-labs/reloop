"use client";

import * as Button from "@ui/components/button";
import { Icon } from "@ui/components/icon";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<motion.div
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			transition={{ duration: 0.1 }}
		>
			<Button.Root
				size="xsmall"
				mode="stroke"
				variant="neutral"
				onClick={() => setTheme(theme === "light" ? "dark" : "light")}
				className="flex size-8 items-center justify-center rounded-full p-0"
			>
				<motion.div
					key={theme}
					initial={{ rotate: -180, opacity: 0 }}
					animate={{ rotate: 0, opacity: 1 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
				>
					<Icon name={theme === "light" ? "moon" : "sun"} className="w-4" />
				</motion.div>
			</Button.Root>
		</motion.div>
	);
}
