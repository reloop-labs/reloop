"use client";

import { Footer } from "@fe/dashboard/components/footer";
import { cn } from "@reloop/ui/cn";
import { MainSidebar } from "./main-sidebar";

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
	return (
		<div className={cn("flex min-h-screen", className)}>
			<MainSidebar />
			<div className="flex flex-1 flex-col">
				<main className="flex-1">{children}</main>
				{showFooter && <Footer />}
			</div>
		</div>
	);
};
