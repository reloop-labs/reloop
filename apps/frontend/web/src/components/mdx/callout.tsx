import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";

const styles = {
	info: "border-information-base/30 bg-information-base/5 text-text-strong-950 dark:text-white",
	warning:
		"border-warning-base/30 bg-warning-base/5 text-text-strong-950 dark:text-white",
	tip: "border-primary-base/30 bg-primary-base/5 text-text-strong-950 dark:text-white",
} as const;

export function Callout({
	type = "info",
	children,
}: {
	type?: keyof typeof styles;
	children: ReactNode;
}) {
	return (
		<aside
			className={cn(
				"my-6 rounded-xl border px-4 py-3 text-[15px] leading-relaxed",
				styles[type],
			)}
		>
			{children}
		</aside>
	);
}
