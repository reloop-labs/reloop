"use client";

import dynamic from "next/dynamic";

export const MacintoshSceneLazy = dynamic(
	() => import("./macintosh-scene").then((m) => m.MacintoshScene),
	{
		ssr: false,
		loading: () => <div className="size-full bg-[#434b57]" />,
	},
);
