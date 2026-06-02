export type FeatureCtaLink = {
	label: string;
	href: string;
	external?: boolean;
};

export type FeatureCtaBand = {
	eyebrow: string;
	title: string;
	titleMuted?: string;
	description: string;
	primary: FeatureCtaLink;
	secondary?: FeatureCtaLink;
};
