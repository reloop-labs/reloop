import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

const blue =
	"border-information-base/25 bg-information-base/[0.06] dark:border-information-base/30 dark:bg-information-base/10";

// Icon on the left, text on the right, tinted by type.
const variants = {
	info: { icon: "info-outline", box: blue, iconColor: "text-information-base" },
	tip: { icon: "bulb", box: blue, iconColor: "text-information-base" },
	warning: {
		icon: "alert-triangle",
		box: "border-warning-base/25 bg-warning-base/[0.06] dark:border-warning-base/30 dark:bg-warning-base/10",
		iconColor: "text-warning-base",
	},
} as const;

export function Callout({
	type = "info",
	children,
}: {
	type?: keyof typeof variants;
	children: ReactNode;
}): ReactNode {
	const variant = variants[type];

	return (
		<aside className={cn("my-6 flex gap-3 rounded-xl border p-4", variant.box)}>
			<Icon
				name={variant.icon}
				className={cn("mt-[5px] size-4 shrink-0", variant.iconColor)}
			/>
			<div className="min-w-0 flex-1 text-[14.5px] text-text-strong-950 leading-relaxed dark:text-white/85 [&_p+p]:mt-3! [&_p]:my-0!">
				{children}
			</div>
		</aside>
	);
}
