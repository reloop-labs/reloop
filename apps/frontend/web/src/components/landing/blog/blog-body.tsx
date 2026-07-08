import { cn } from "@reloop/ui/cn";
import type { ReactNode } from "react";

export function BlogBody({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return <div className={cn("blog-prose", className)}>{children}</div>;
}
