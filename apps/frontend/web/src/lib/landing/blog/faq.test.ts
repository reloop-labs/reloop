import { describe, expect, test } from "bun:test";
import { extractFaq } from "./faq";
import { buildBlogPostJsonLd } from "./seo";

const post = {
	slug: "example",
	title: "Example",
	description: "An example post.",
	keywords: [],
	publishedAt: "2026-10-26",
	category: "Tutorials",
	tags: [],
	readTime: "5 min read",
	author: { name: "Pranav Patel", role: "Co-founder" },
};

describe("extractFaq", () => {
	test("reads question and answer from each Accordion", () => {
		const faq = extractFaq(`
## FAQ

<AccordionGroup>
  <Accordion title="Is port 587 or 465 more secure?">
    Both encrypt the **whole** session. See [RFC 8314](https://example.com)
    and use \`starttls()\`.
  </Accordion>

  <Accordion title="Second?">
    Yes.
  </Accordion>
</AccordionGroup>
`);

		expect(faq).toEqual([
			{
				question: "Is port 587 or 465 more secure?",
				answer:
					"Both encrypt the whole session. See RFC 8314 and use starttls().",
			},
			{ question: "Second?", answer: "Yes." },
		]);
	});

	test("returns nothing for a post without accordions", () => {
		expect(extractFaq("## Intro\n\nJust text.")).toEqual([]);
	});

	test("skips accordions with an empty answer", () => {
		expect(extractFaq('<Accordion title="Empty"></Accordion>')).toEqual([]);
	});
});

describe("buildBlogPostJsonLd FAQPage", () => {
	test("adds a FAQPage node when the post has questions", () => {
		const graph = buildBlogPostJsonLd(post, [{ question: "Q?", answer: "A." }])[
			"@graph"
		];
		const faqPage = graph.find((node) => node["@type"] === "FAQPage");

		expect(faqPage).toMatchObject({
			mainEntity: [
				{
					"@type": "Question",
					name: "Q?",
					acceptedAnswer: { "@type": "Answer", text: "A." },
				},
			],
		});
	});

	test("omits FAQPage when there are no questions", () => {
		const graph = buildBlogPostJsonLd(post)["@graph"];
		expect(graph.some((node) => node["@type"] === "FAQPage")).toBe(false);
	});
});
