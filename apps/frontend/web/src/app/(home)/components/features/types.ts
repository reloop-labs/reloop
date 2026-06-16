import type { ReactNode } from "react";

export type FeatureCard = {
	title: string;
	description: string;
};

export type FeatureData = {
	label: string;
	title: string;
	description: string;
	visual: React.ComponentType;
	containerClassName?: string;
	hideBackground?: boolean;
	bgImage?: string;
	cards: FeatureCard[];
};

export type FeatureSectionProps = {
	feature: FeatureData;
	index: number;
	forwardRef: (el: HTMLDivElement | null) => void;
	isLast?: boolean;
};
