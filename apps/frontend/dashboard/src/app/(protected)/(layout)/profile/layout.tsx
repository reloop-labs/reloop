import type { Metadata } from "next";
import { SettingsTabs } from "./tabs";

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
	return (
		<div className="mx-auto max-w-3xl px-6 pt-16">
			<div className="pb-6">
				<p className="font-medium text-2xl">Settings</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Change the settings for your current workspace
				</p>
			</div>
			<SettingsTabs />
			<div className="w-full flex-1 pb-10">{children}</div>
		</div>
	);
}
