"use client";

import { Footer } from "@fe/dashboard/components/footer";
import { useLayout } from "@fe/dashboard/providers/layout-provider";
import { cn } from "@reloop/ui/cn";
import { MainSidebar } from "./main-sidebar";
import { MainTopbar } from "./main-topbar";

interface AdaptiveLayoutProps {
	children: React.ReactNode;
	className?: string;
	showFooter?: boolean;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
	children,
	className,
	showFooter = true,
}) => {
	const { layoutMode } = useLayout();

	if (layoutMode === "sidebar") {
		return (
			<div className={cn("flex min-h-screen", className)}>
				<MainSidebar />
				<div className="flex flex-1 flex-col">
					<main className="flex-1">{children}</main>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex min-h-screen flex-col", className)}>
			<MainTopbar />
			<main className="flex-1">{children}</main>
			{showFooter && <Footer />}
		</div>
	);
};
