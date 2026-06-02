import LanguageBento from "../components/language-bento";
import LanguageCode from "../components/language-code";
import LanguageCta from "../components/language-cta";
import LanguageGuide from "../components/language-guide";
import LanguageHero from "../components/language-hero";
import { getLanguage, isLanguageSlug, LANGUAGE_SLUGS } from "../languages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
	params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
	return LANGUAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const language = getLanguage(slug);
	if (!language) {
		return { title: "Language | Reloop" };
	}
	return {
		title: `Send Email with ${language.name} | Reloop`,
		description: language.shortDescription,
		openGraph: {
			title: `Send Email with ${language.name} | Reloop`,
			description: language.shortDescription,
			type: "website",
		},
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
		<div>
			<LanguageHero language={language} />
			<LanguageCode language={language} />
			<LanguageBento language={language} />
			<LanguageGuide language={language} />
			<LanguageCta language={language} />
		</div>
	);
}
