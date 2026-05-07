import type { Metadata } from "next";
import { SettingsTabs } from "./tabs";

export function generateMetadata(): Metadata {
	return {
		title: "Profile · Reloop",
		description: "Manage your personal account and profile information.",
		openGraph: {
			title: "Profile · Reloop",
			description: "Manage your personal account and profile information.",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: "Profile · Reloop",
			description: "Manage your personal account and profile information.",
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
				<p className="font-medium text-2xl">Profile</p>
				<p className="text-paragraph-sm text-text-sub-600">
					Manage your personal account and profile information.
				</p>
			</div>
			<SettingsTabs />
			<div className="w-full flex-1 pb-10">{children}</div>
		</div>
	);
}
