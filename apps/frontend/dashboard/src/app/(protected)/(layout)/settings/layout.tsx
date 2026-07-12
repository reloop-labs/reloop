import type { Metadata } from "next";
import { SettingsShell } from "./settings-shell";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export function generateMetadata(): Metadata {
	return {
		title: "Workspace · Reloop",
		description: "Manage your workspace settings, name, handle, and logo.",
		openGraph: {
			title: "Workspace · Reloop",
			description: "Manage your workspace settings, name, handle, and logo.",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: "Workspace · Reloop",
			description: "Manage your workspace settings, name, handle, and logo.",
		},
	};
}

export default function WorkspaceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SettingsShell>{children}</SettingsShell>;
}
