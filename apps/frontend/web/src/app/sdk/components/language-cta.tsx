import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import type { LanguageDefinition } from "../languages";

export default function LanguageCta({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<BlogCta
			headline={`Send with ${language.name}.`}
			sub="Get an API key, verify your domain, and ship transactional email in minutes."
			primaryLabel="Get API Key"
			primaryHref="/dashboard/signup"
			secondaryLabel="Docs"
			secondaryHref={language.docsPath}
			accentColor="blue"
		/>
	);
}
