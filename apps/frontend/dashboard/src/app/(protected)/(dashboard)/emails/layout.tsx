import { EmailsLayoutClient } from "./layout-client";

export default function EmailsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <EmailsLayoutClient>{children}</EmailsLayoutClient>;
}
