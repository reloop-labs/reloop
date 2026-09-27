export type Testimonial = {
	quote: string;
	name: string;
	initials: string;
	/** Link to the original post — the whole card links here. */
	sourceUrl?: string;
	/** Avatar image URL (e.g. X profile picture). Falls back to initials. */
	avatarUrl?: string;
};

// Add more entries here as they come in — the section auto-rotates
// and shows progress dots once there are 2 or more.
export const testimonials: Testimonial[] = [
	{
		quote: "Most underrated Github project",
		name: "Alexis Maresca",
		initials: "AM",
		sourceUrl: "https://x.com/MarescaAlexis/status/2092973405553238462",
		avatarUrl:
			"https://pbs.twimg.com/profile_images/2092634806647455744/oDSXFFr0.jpg",
	},
	{
		quote:
			"If your still using resend what are you doing. @reloop_labs is infinitely better.",
		name: "mulu mex",
		initials: "MM",
		sourceUrl: "https://x.com/mulumexx/status/2098345235268948476",
		avatarUrl:
			"https://pbs.twimg.com/profile_images/2093200456138862592/1uFOXfFv.jpg",
	},
];
