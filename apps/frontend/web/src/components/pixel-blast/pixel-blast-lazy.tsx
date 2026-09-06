"use client";

import dynamic from "next/dynamic";

export const PixelBlastLazy = dynamic(
	() => import("./pixel-blast").then((m) => m.PixelBlast),
	{ ssr: false },
);
