export type FeatureCtaLink = {
	label: string;
	href: string;
	external?: boolean;
};

export type FeatureCtaBand = {
	title: string;
	titleMuted?: string;
	highlightTitleMuted?: boolean;
	description: string;
	primary: FeatureCtaLink;
	secondary?: FeatureCtaLink;
};
