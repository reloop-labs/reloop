import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";

export function EmailHtmlEditorCta() {
	return (
		<BlogCta
			headlineLine1="Ready to send your templates?"
			headlineLine2="Let's talk."
			sub="Save templates to Reloop and send them with 3,000 free emails every month. Version history, variables, and deliverability built in."
			primaryLabel="Get started free"
			flush
			showTopRule={false}
		/>
	);
}
