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

import { TwitterDeleteApiKeyComparison } from "./components/twitter-delete-api-key-comparison";

export default function TwitterPage() {
	return <TwitterDeleteApiKeyComparison />;
}
