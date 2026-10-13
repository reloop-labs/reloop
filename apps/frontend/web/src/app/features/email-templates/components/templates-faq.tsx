import { Icon } from "@reloop/ui/icon";
import { FaqSection } from "@reloop/web/components/faq-section";

export const templatesFaq = [
	{
		question: "Do I need to know HTML to build a template?",
		answer:
			"No. The visual editor has blocks for text, headings, buttons, images, columns, dividers and footers, and it writes the email-safe HTML for you. If you prefer code, switch to the HTML view or paste in markup you already have.",
	},
	{
		question: "How do I send an email with a template?",
		answer:
			"Publish the template, then call the send endpoint with a template object containing its id and your variables. The email uses the latest published version, so you can keep editing the draft without changing what goes out.",
	},
	{
		question: "How do variables work?",
		answer:
			"Add a variable such as {{{first_name}}} anywhere in the template and give it an optional default. At send time, values you pass in variables replace the placeholders, and any you leave out fall back to their default.",
	},
	{
		question: "Can I build templates from ChatGPT, Claude or Cursor?",
		answer:
			"Yes. Connect the Reloop MCP server to your AI tool, or run the Reloop CLI to set it up, then ask for the email you need. The assistant writes the HTML and saves it to Reloop as a published template with its variables, so you can send it by ID or open it in the editor later.",
	},
	{
		question: "Can I undo a change after publishing?",
		answer:
			"Yes. Every published version is kept in the history panel. You can compare versions side by side and restore an earlier one in a click.",
	},
	{
		question: "Can I test a template before it goes live?",
		answer:
			"Yes. Preview it on desktop, tablet and mobile sizes, then send a test email to your own inbox from the editor.",
	},
	{
		question: "What does it cost?",
		answer:
			"Templates are included on every plan, including the free plan with 3,000 emails a month and no credit card. You can also try the editor without an account.",
	},
];

export function TemplatesFaq() {
	return (
		<FaqSection
			items={templatesFaq}
			id="templates-faq"
			eyebrow={
				<>
					<Icon name="question" className="size-3.5" aria-hidden />
					FAQ
				</>
			}
			eyebrowClassName="inline-flex items-center gap-1.5 text-[13px] text-text-sub-600 normal-case dark:text-white/60"
			title="Questions about templates."
			compact
			plain
		/>
	);
}
