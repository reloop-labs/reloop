import { ProtectedLayoutClient } from "./protected-layout-client";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
