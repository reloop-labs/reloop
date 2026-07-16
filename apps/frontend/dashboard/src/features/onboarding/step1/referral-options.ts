export type ReferralOption = {
	id: string;
	label: string;
	iconSlug: string;
};

export const REFERRAL_OPTIONS: ReferralOption[] = [
	{ id: "google", label: "Google Search", iconSlug: "siGoogle" },
	{ id: "github", label: "GitHub", iconSlug: "siGithub" },
	{ id: "twitter", label: "Twitter / X", iconSlug: "siX" },
	{ id: "linkedin", label: "LinkedIn", iconSlug: "siLinkedin" },
	{
		id: "community",
		label: "Online Community (Reddit, Slack, Discord)",
		iconSlug: "siDiscord",
	},
	{ id: "blog", label: "Blog or Article", iconSlug: "siMedium" },
	{ id: "newsletter", label: "Newsletter", iconSlug: "siSubstack" },
	{ id: "youtube", label: "YouTube or Video", iconSlug: "siYoutube" },
	{ id: "podcast", label: "Podcast", iconSlug: "siSpotify" },
	{ id: "ad", label: "Advertisement", iconSlug: "siGoogleads" },
	{ id: "other", label: "Other", iconSlug: "siSafari" },
];
