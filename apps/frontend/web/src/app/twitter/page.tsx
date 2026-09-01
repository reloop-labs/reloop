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

import { TwitterModalsShowcase } from "./components/twitter-modals-showcase";

export default function TwitterPage() {
	return <TwitterModalsShowcase />;
}
