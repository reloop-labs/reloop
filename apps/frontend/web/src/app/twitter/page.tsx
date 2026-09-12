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

import { TwitterContactIdShowcase } from "./components/twitter-contact-id-showcase";

export default function TwitterPage() {
	return <TwitterContactIdShowcase />;
}
