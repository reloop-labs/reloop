import type { ReactNode } from "react";
import { BlueprintBase } from "./blueprint-base";

/** Shared 200x160 shell for card blueprint arts. */
export function CardArtSvg({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<svg
			viewBox="0 0 200 160"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<BlueprintBase>{children}</BlueprintBase>
		</svg>
	);
}
