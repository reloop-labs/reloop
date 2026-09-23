import { JsonLd } from "@reloop/web/components/json-ld";
import { BlueprintCta } from "@reloop/web/components/landing/blueprint-cta";
import { breadcrumbJsonLd } from "@reloop/web/lib/schema";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FrameworkHero from "../../sdk/components/framework-hero";
import FrameworkMore from "../../sdk/components/framework-more";
import FrameworkSteps from "../../sdk/components/framework-steps";
import { SectionFrame } from "../../sdk/components/section-frame";
import {
	FRAMEWORK_SLUGS,
	getFramework,
	isFrameworkSlug,
} from "../../sdk/frameworks";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type PageProps = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return FRAMEWORK_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const framework = getFramework(slug);
	if (!framework) {
		return { title: "Framework | Reloop" };
	}
	const title = `${framework.name} Email API: Send Transactional Email from ${framework.name}`;
	const socialTitle = `Send Email with ${framework.name} | Reloop`;
	const description = `Send transactional email from ${framework.name} with the Reloop ${framework.languageName} SDK: install, add your API key, verify a domain, and send.`;
	const url = `${getSiteUrl()}/frameworks/${framework.slug}`;
	const ogImage = {
		url: `${url}/opengraph-image`,
		width: 1200,
		height: 630,
		alt: `${framework.name} | Reloop`,
	};
	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			title: socialTitle,
			description,
			type: "website",
			url,
			siteName: "Reloop",
			images: [ogImage],
		},
		twitter: {
			card: "summary_large_image",
			title: socialTitle,
			description,
			images: [ogImage.url],
		},
		keywords: [
			`${framework.name} email`,
			`send email ${framework.name}`,
			`${framework.name} transactional email`,
			`${framework.name} integration`,
			`${framework.languageName} email SDK`,
			"Reloop",
		],
	};
}

export default async function FrameworkPage({ params }: PageProps) {
	const { slug } = await params;
	if (!isFrameworkSlug(slug)) {
		notFound();
	}
	const framework = getFramework(slug);
	if (!framework) {
		notFound();
	}

	return (
		<main className="w-full max-w-full overflow-x-clip bg-bg-white-0 dark:bg-black">
			<JsonLd
				data={breadcrumbJsonLd([
					{ name: "Frameworks", path: "/frameworks" },
					{ name: framework.name, path: `/frameworks/${framework.slug}` },
				])}
			/>
			<FrameworkHero framework={framework} />
			<FrameworkSteps framework={framework} />
			<FrameworkMore current={framework} />
			<SectionFrame>
				<div aria-hidden className="h-12 sm:h-16" />
				<BlueprintCta
					headlineLine1={`Ready to send with ${framework.name}?`}
					headlineLine2="Let's talk."
					subtext="3,000 free emails every month. Modern email infrastructure and deliverability built for developers."
					primaryLabel="Get started free"
					primaryHref="/dashboard/signup"
					secondaryLabel="Schedule call"
					secondaryHref="https://cal.com/pranavp/30"
				/>
			</SectionFrame>
		</main>
	);
}
