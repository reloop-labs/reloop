import { cn } from "@reloop/ui/cn";
import React from "react";
import { CodePortal } from "../docs/code-column-context";

interface SideBySideProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * A component that splits its children.
 * The first child is rendered in-place (Documentation).
 * The second child is teleported to the sticky right column (Code).
 */
export function SideBySide({ children, className }: SideBySideProps) {
	const childrenArray = React.Children.toArray(children).filter(Boolean);
	const left = childrenArray[0];
	const right = childrenArray[1];

	return (
		<div className={cn("relative", className)}>
			{/* Render left column in-place */}
			<div className="min-w-0">{left}</div>

			{/* Teleport right column to the global sticky column */}
			<CodePortal>
				<div>{right}</div>
			</CodePortal>

			{/* Mobile: Still show code below documentation */}
			<div className="mt-8 lg:hidden">{right}</div>
		</div>
	);
}

/**
 * A simple pass-through component to group MDX content
 * without using a <div> which can break Markdown parsing.
 */
export function Side({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
