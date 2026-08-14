import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";
import type { BlogArtVariant } from "./types";

const VIEWBOX = "0 0 600 375";

export function BlogArtCanvas({
	variant,
	children,
	className,
}: {
	variant: BlogArtVariant;
	children: ReactNode;
	className?: string;
}) {
	const isCard = variant === "card";

	return (
		<div
			className={cn(
				"relative overflow-hidden text-text-strong-950 dark:text-white",
				isCard
					? "aspect-[16/10] rounded-xl bg-bg-weak-50 dark:bg-[#111]"
					: "mx-auto aspect-[2/1] w-full max-w-[720px]",
				className,
			)}
		>
			<svg
				className="absolute inset-0 size-full"
				viewBox={VIEWBOX}
				aria-hidden="true"
				preserveAspectRatio={isCard ? "xMidYMid slice" : "xMidYMid meet"}
			>
				{children}
			</svg>
		</div>
	);
}
