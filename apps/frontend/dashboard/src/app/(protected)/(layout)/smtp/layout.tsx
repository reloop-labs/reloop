import type { Metadata } from "next";

export function generateMetadata(): Metadata {
	return {
		title: "SMTP Relay · Reloop",
		description: "Send emails using SMTP relay.",
	};
}

export default function SMTPLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 p-6 lg:p-8">
			<div className="w-full flex-1 pb-10 pt-1">{children}</div>
		</div>
	);
}
