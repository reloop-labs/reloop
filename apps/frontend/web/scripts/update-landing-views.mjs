import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "../src/app");

function write(relativePath, content) {
	const full = path.join(__dirname, "..", relativePath);
	fs.mkdirSync(path.dirname(full), { recursive: true });
	fs.writeFileSync(full, content);
}

function toPascalCase(slug) {
	return slug
		.split("-")
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join("");
}

// Generate each category with templates
function useCasePage(slug) {
	write(
		`src/app/use-cases/${slug}/page.tsx`,
		`import { UseCasePageView } from "@reloop/web/components/landing/use-cases/use-case-page-view";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/use-cases/${slug}";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function ${toPascalCase(slug)}Page() {
	return <UseCasePageView config={config} />;
}
`,
	);
}

function alternativePage(slug) {
	write(
		`src/app/alternatives/${slug}/page.tsx`,
		`import { AlternativePageView } from "@reloop/web/components/landing/alternatives/alternative-page-view";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/alternatives/${slug}";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function ${toPascalCase(slug)}AlternativePage() {
	return <AlternativePageView config={config} />;
}
`,
	);
}

function integrationPage(slug) {
	write(
		`src/app/integrations/${slug}/page.tsx`,
		`import { IntegrationPageView } from "@reloop/web/components/landing/integrations/integration-page-view";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/integrations/${slug}";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function ${toPascalCase(slug)}IntegrationPage() {
	return <IntegrationPageView config={config} />;
}
`,
	);
}

function personaPage(slug) {
	write(
		`src/app/for/${slug}/page.tsx`,
		`import { PersonaPageView } from "@reloop/web/components/landing/personas/persona-page-view";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { config } from "@reloop/web/lib/landing/personas/${slug}";

export const instant = false;

export const metadata = createLandingMetadata(
	config.titleLines.join(" "),
	config.description,
	config.path,
	config.keywords,
);

export default function ${toPascalCase(slug)}PersonaPage() {
	return <PersonaPageView config={config} />;
}
`,
	);
}

function glossaryPage(slug) {
	write(
		`src/app/glossary/${slug}/page.tsx`,
		`import { GlossaryTermPageView } from "@reloop/web/components/landing/glossary/glossary-term-page-view";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { term } from "@reloop/web/lib/landing/glossary/${slug}";

export const instant = false;

export const metadata = createLandingMetadata(
	term.title,
	term.description,
	\`/glossary/\${term.slug}\`,
	term.keywords,
);

export default function ${toPascalCase(slug)}GlossaryPage() {
	return (
		<GlossaryTermPageView
			term={term}
			cta={defaultLandingCta(
				"Put it into practice",
				"Reloop gives you the tools to improve deliverability and send with confidence.",
			)}
		/>
	);
}
`,
	);
}

function blogPage(slug) {
	write(
		`src/app/company/blog/${slug}/page.tsx`,
		`import { BlogPostPageView } from "@reloop/web/components/landing/blog/blog-post-page-view";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { post } from "@reloop/web/lib/landing/blog/${slug}";

export const instant = false;

export const metadata = createLandingMetadata(
	post.title,
	post.description,
	\`/company/blog/\${post.slug}\`,
	post.keywords,
);

export default function ${toPascalCase(slug)}BlogPage() {
	return (
		<BlogPostPageView
			post={post}
			cta={defaultLandingCta(
				"Ready to try Reloop?",
				"Open-source email infrastructure with a free hosted tier.",
			)}
		/>
	);
}
`,
	);
}

const useCases = fs
	.readdirSync(path.join(appRoot, "use-cases"))
	.filter((f) => fs.statSync(path.join(appRoot, "use-cases", f)).isDirectory() && f !== "page.tsx");
const alternatives = fs
	.readdirSync(path.join(appRoot, "alternatives"))
	.filter((f) => fs.statSync(path.join(appRoot, "alternatives", f)).isDirectory());
const integrations = fs
	.readdirSync(path.join(appRoot, "integrations"))
	.filter((f) => fs.statSync(path.join(appRoot, "integrations", f)).isDirectory());
const personas = fs
	.readdirSync(path.join(appRoot, "for"))
	.filter((f) => fs.statSync(path.join(appRoot, "for", f)).isDirectory());
const glossary = fs
	.readdirSync(path.join(appRoot, "glossary"))
	.filter((f) => fs.statSync(path.join(appRoot, "glossary", f)).isDirectory());
const blog = fs
	.readdirSync(path.join(appRoot, "company/blog"))
	.filter((f) => fs.statSync(path.join(appRoot, "company/blog", f)).isDirectory());

for (const slug of useCases) useCasePage(slug);
for (const slug of alternatives) alternativePage(slug);
for (const slug of integrations) integrationPage(slug);
for (const slug of personas) personaPage(slug);
for (const slug of glossary) glossaryPage(slug);
for (const slug of blog) blogPage(slug);

console.log(
	`Updated ${useCases.length + alternatives.length + integrations.length + personas.length + glossary.length + blog.length} pages`,
);
