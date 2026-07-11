import type { Metadata } from "next";

export function generateMetadata(): Metadata {
	return {
		title: "Integrations · Reloop",
		description: "Connect your favorite tools and automate your workflows.",
	};
}

export default function IntegrationsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
			<div className="w-full flex-1 pb-10">{children}</div>
		</div>
	);
}
