"use client";

import dynamic from "next/dynamic";

export const MacintoshHeroMonitorLazy = dynamic(
	() => import("./hero-monitor").then((m) => m.MacintoshHeroMonitor),
	{ ssr: false },
);
