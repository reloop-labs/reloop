"use client";

import { SettingsShell } from "#/features/settings/settings-shell";

export function SettingsLayoutClient({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SettingsShell>{children}</SettingsShell>;
}
