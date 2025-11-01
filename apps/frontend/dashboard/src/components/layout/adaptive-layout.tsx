"use client";

import { cn } from "@reloop/ui/cn";
import { MainSidebar } from "./main-sidebar";

interface AdaptiveLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
	children,
	className,
}) => {
	return (
		<div className={cn("flex min-h-screen", className)}>
			<MainSidebar />
			<main className="flex-1">{children}</main>
		</div>
	);
};
