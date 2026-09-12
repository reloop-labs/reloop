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

import { TwitterEditContactComparison } from "./components/twitter-edit-contact-comparison";

export default function TwitterPage() {
	return (
		<div className="flex min-h-dvh w-full items-center justify-center bg-white p-6 py-12 antialiased dark:bg-[#080808]">
			<TwitterEditContactComparison />
		</div>
	);
}
