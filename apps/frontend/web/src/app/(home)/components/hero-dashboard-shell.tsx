"use client";

import type { ReactNode } from "react";
import { HeroDashboardHeader } from "./hero-dashboard-header";
import {
	HeroDashboardSidebar,
	NAV_SECTIONS,
	type NavGroup,
	type NavItem,
} from "./hero-dashboard-sidebar";

export {
	HeroDashboardSidebar,
	HeroDashboardHeader,
	NAV_SECTIONS,
	type NavGroup,
	type NavItem,
};

export function HeroDashboardShell({
	children,
	activeItem = "emails",
	onItemClick,
}: {
	children: ReactNode;
	activeItem?: string;
	onItemClick?: (id: string) => void;
}) {
	return (
		<div className="flex h-full min-h-0 bg-bg-white-0">
			<HeroDashboardSidebar activeItem={activeItem} onItemClick={onItemClick} />

			<div className="flex min-w-0 flex-1 flex-col">
				<HeroDashboardHeader />
				<div className="relative min-h-0 flex-1 overflow-hidden">
					{children}
				</div>
			</div>
		</div>
	);
}
