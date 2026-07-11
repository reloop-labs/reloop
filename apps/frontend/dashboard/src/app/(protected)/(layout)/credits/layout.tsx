import type { Metadata } from "next";

export function generateMetadata(): Metadata {
	return {
		title: "Usage & Credits · Reloop",
		description: "View organization email usage statistics, rate limits, and credit ledger logs.",
	};
}

export default function CreditsLayout({
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
