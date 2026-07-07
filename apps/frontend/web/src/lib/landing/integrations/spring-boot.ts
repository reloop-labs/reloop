import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "spring-boot",
	path: "/integrations/spring-boot",
	titleLines: ["Send Email", "with Spring Boot"],
	description:
		"Integrate Reloop into Spring Boot apps with the Java SDK or JavaMail SMTP.",
	keywords: [
		"Spring Boot email",
		"Java transactional email",
		"Spring Boot email API",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Java SDK",
		href: "/languages/java",
	},
	sections: [
		{
			title: "Spring Boot setup",
			items: [
				{
					title: "Java SDK",
					description:
						"Inject ReloopEmail client as a Spring bean for service-layer sends.",
				},
				{
					title: "JavaMail SMTP",
					description:
						"Configure spring.mail properties for Reloop SMTP relay.",
				},
				{
					title: "Async delivery",
					description: "@Async mail sends for non-blocking request handling.",
				},
			],
		},
	],
	cta: {
		title: "Enterprise Java email",
		titleMuted: "Start free today.",
		description: "Maven/Gradle dependency and production-ready defaults.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
};
