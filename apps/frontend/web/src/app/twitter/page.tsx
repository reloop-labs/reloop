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

import { MacintoshSceneLazy } from "./components/macintosh-scene-lazy";

export default function TwitterPage() {
	return (
		<div
			data-standalone="true"
			className="relative h-dvh w-full overflow-hidden bg-[#5a5a5a]"
		>
			<MacintoshSceneLazy />
		</div>
	);
}
