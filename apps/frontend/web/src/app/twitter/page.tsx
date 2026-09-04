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

import { TwitterCreateWebhookComparison } from "./components/twitter-create-webhook-comparison";

export default function TwitterPage() {
	return <TwitterCreateWebhookComparison />;
}
