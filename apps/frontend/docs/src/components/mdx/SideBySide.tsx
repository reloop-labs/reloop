import { CodePortal } from "@reloop/fe-docs/components/docs/code-column-context";
import { cn } from "@reloop/ui/cn";
import React from "react";

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
			{/* Phone + tablet / iPad: code first, docs second */}
			<div className="mb-8 xl:hidden">{right}</div>

			{/* Docs column (always in-flow) */}
			<div className="min-w-0">{left}</div>

			{/* Desktop: teleport right column to sticky sidebar */}
			<CodePortal>
				<div>{right}</div>
			</CodePortal>
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
