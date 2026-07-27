import { ProtectedLayoutClient } from "./protected-layout-client";

// Session gate is client-only — not eligible for instant navigation.
export const instant = false;

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
