import { SecurityShell } from "./client";

export default function SecurityLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SecurityShell>{children}</SecurityShell>;
}
