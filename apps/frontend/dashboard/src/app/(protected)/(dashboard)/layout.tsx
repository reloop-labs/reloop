import { DashboardLayoutClient } from "./dashboard-layout-client";

// Client chrome + membership gates — not eligible for instant navigation.
export const instant = false;

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
