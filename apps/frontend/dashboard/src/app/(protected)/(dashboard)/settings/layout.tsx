import { SettingsLayoutClient } from "./layout-client";

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SettingsLayoutClient>{children}</SettingsLayoutClient>;
}
