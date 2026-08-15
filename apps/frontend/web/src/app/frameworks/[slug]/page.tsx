import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FrameworkHero from "../../sdk/components/framework-hero";
import FrameworkMore from "../../sdk/components/framework-more";
import FrameworkSteps from "../../sdk/components/framework-steps";
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
	const title = `Send Email with ${framework.name} | Reloop`;
	const description = `${framework.shortDescription} Step-by-step: install, set your API key, and send.`;
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
			title,
			description,
			type: "website",
			url,
			siteName: "Reloop",
			images: [ogImage],
		},
		twitter: {
			card: "summary_large_image",
			title,
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
			<FrameworkHero framework={framework} />
			<FrameworkSteps framework={framework} />
			<FrameworkMore current={framework} />
			<BlogCta
				headline={`Send with ${framework.name}.`}
				sub={`Get an API key and ship transactional email from ${framework.name} using the official ${framework.languageName} SDK.`}
				primaryLabel="Get API Key"
				primaryHref="/dashboard/signup"
				accentHex={framework.icon.hex}
			/>
		</main>
	);
}
