import { cn } from "@reloop/ui/cn";
import { KbdKey } from "@reloop/ui/kbd-key";
import type { ReactNode } from "react";

const shortcutKbdClassName = cn(
	"h-4 w-4 min-w-4 rounded-[5px] px-0 text-[10px] leading-none",
	"border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600",
	// bottom shelf under the key
	"shadow-[0_1.5px_0_0_var(--color-stroke-soft-200)]",
	"dark:border-white/[0.14] dark:bg-white/[0.07] dark:text-white",
	"dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06),inset_0_0.5px_0_0_rgba(255,255,255,0.08)]",
);

export function ActionKbd({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<KbdKey className={cn(shortcutKbdClassName, "max-sm:hidden", className)}>
			{children}
		</KbdKey>
	);
}
