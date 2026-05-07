"use client";

import CodeSnippet from "../code-snippet";
import { FeatureSection } from "./feature-section";
import type { FeatureData, FeatureSectionProps } from "./types";

const sdkData: FeatureData = {
	label: "SDK",
	title: "The email API for developers",
	description:
		"A simple, elegant interface so you can start sending emails in minutes. It fits right into your code with SDKs for your favorite programming languages.",
	visual: CodeSnippet,
	containerClassName: "bg-transparent shadow-none px-0 py-0",
	hideBackground: true,
	bgImage: "",
	cards: [],
};

export function SDKSection({
	index,
	forwardRef,
	isLast,
}: Omit<FeatureSectionProps, "feature">) {
	return (
		<FeatureSection
			feature={sdkData}
			index={index}
			forwardRef={forwardRef}
			isLast={isLast}
		/>
	);
}
