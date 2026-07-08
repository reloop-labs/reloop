"use client";

import dynamic from "next/dynamic";

export const AsciiWordmarkLazy = dynamic(
	() =>
		import("./ascii-wordmark-section").then((m) => m.AsciiWordmarkSection),
	{ ssr: false },
);
