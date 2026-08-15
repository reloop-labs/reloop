import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageFrameworks from "../components/language-frameworks";
import LanguageHero from "../components/language-hero";
import LanguageMore from "../components/language-more";
import LanguageSteps from "../components/language-steps";
import { getLanguage, isLanguageSlug, LANGUAGE_SLUGS } from "../languages";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type PageProps = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return LANGUAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const language = getLanguage(slug);
	if (!language) {
		return { title: "SDK | Reloop" };
	}
	const title = `Send Email with ${language.name} | Reloop`;
	const description = `${language.shortDescription} Step-by-step: install, set your API key, and send.`;
	const url = `${getSiteUrl()}/sdk/${language.slug}`;
	const ogImage = {
		url: `${url}/opengraph-image`,
		width: 1200,
		height: 630,
		alt: `${language.name} SDK | Reloop`,
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
			`${language.name} email`,
			`send email ${language.name}`,
			`${language.name} transactional email`,
			`${language.name} SDK`,
			`${language.packageName}`,
			"Reloop",
		],
	};
}

export default async function LanguagePage({ params }: PageProps) {
	const { slug } = await params;
	if (!isLanguageSlug(slug)) {
		notFound();
	}
	const language = getLanguage(slug);
	if (!language) {
		notFound();
	}

	return (
		<main className="w-full max-w-full overflow-x-clip bg-bg-white-0 dark:bg-black">
			<LanguageHero language={language} />
			<LanguageSteps language={language} />
			<LanguageFrameworks language={language} />
			<LanguageMore current={language} />
			<BlogCta
				headline={`Send with ${language.name}.`}
				sub={`Get an API key and ship transactional email from ${language.name} using the official SDK.`}
				primaryLabel="Get API Key"
				primaryHref="/dashboard/signup"
				accentHex={language.icon.hex}
			/>
		</main>
	);
}
