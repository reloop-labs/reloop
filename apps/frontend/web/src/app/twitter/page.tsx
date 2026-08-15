import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Twitter",
	description: "Twitter",
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
		},
	},
};

export default function TwitterPage() {
	return (
		<div
			data-standalone="true"
			className="flex min-h-screen items-center justify-center p-4"
		>
			<p className="font-medium text-base text-text-strong-950 dark:text-white">
				hello world
			</p>
		</div>
	);
}
