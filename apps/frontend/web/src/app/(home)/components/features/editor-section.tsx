"use client";

import { FeatureSection } from "./feature-section";
import type { FeatureData, FeatureSectionProps } from "./types";
import { TeamVisual } from "./visuals";

const editorData: FeatureData = {
	label: "Editor",
	title: "Design and ship templates in record time",
	description:
		"Stop wrestling with HTML and CSS in isolation. Reloop’s real-time editor allows your entire team to design, preview, and deploy beautiful emails without the usual friction.",
	visual: TeamVisual,
	bgImage:
		"https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070",
	cards: [
		{
			title: "Live visual previews",
			description:
				"See your changes instantly across dozens of desktop and mobile devices while you build.",
		},
		{
			title: "Collaborate without friction",
			description:
				"Bring designers and developers together in one workspace with shared styles and built-in feedback.",
		},
		{
			title: "Zero-risk deployments",
			description:
				"Every change is versioned, so you can roll back instantly or review full diffs before going live.",
		},
	],
};

export function EditorSection({ index, forwardRef, isLast }: Omit<FeatureSectionProps, "feature">) {
	return (
		<FeatureSection
			feature={editorData}
			index={index}
			forwardRef={forwardRef}
			isLast={isLast}
		/>
	);
}
