import { contactEmail, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Script from "next/script";
import { ContactPanel } from "./contact-form";

function CheckItem({ children }: { children: React.ReactNode }) {
	return (
		<li className="flex items-start gap-3 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
			<span
				className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-text-strong-950 dark:bg-white"
				aria-hidden="true"
			>
				<svg
					className="size-2.5 text-white dark:text-black"
					viewBox="0 0 12 12"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2.5 6L5 8.5L9.5 3.5"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
			{children}
		</li>
	);
}

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const contactPageUrl = `${siteUrl}/contact`;

export const metadata: Metadata = {
	title: "Contact Support | Reloop",
	description:
		"Get help with Reloop. Start a live chat, ask product questions, report issues, or leave feedback.",
	keywords: [
		"contact Reloop",
		"Reloop support",
		"email platform support",
		"Reloop Labs help",
		"open source email support",
	],
	openGraph: {
		title: "Contact Support | Reloop",
		description:
			"Get help with Reloop. Start a live chat, ask product questions, report issues, or leave feedback.",
		type: "website",
		url: contactPageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Contact Support | Reloop",
		description:
			"Get help with Reloop. Start a live chat, ask product questions, report issues, or leave feedback.",
	},
	alternates: {
		canonical: contactPageUrl,
	},
};

const contactPageSchema = {
	"@context": "https://schema.org",
	"@type": "ContactPage",
	name: "Contact Reloop Support",
	url: contactPageUrl,
	mainEntity: {
		"@type": "Organization",
		name: "Reloop Labs",
		url: siteUrl,
		email: contactEmail,
	},
};

const ContactPage = () => {
	return (
		<>
			<Script
				id="contact-page-schema"
				type="application/ld+json"
				strategy="afterInteractive"
			>
				{JSON.stringify(contactPageSchema)}
			</Script>

			<section className="flex min-h-[calc(100dvh-4.5rem)] items-center bg-bg-white-0 dark:bg-black">
				<div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
					<div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
						<div>
							<h1 className="font-semibold text-[2rem] text-text-strong-950 tracking-tight sm:text-[2.25rem] dark:text-white">
								Contact support
							</h1>
							<ul className="mt-8 space-y-4">
								<CheckItem>Ask product questions</CheckItem>
								<CheckItem>
									Report problems or unexpected behaviour
								</CheckItem>
								<CheckItem>Leave feedback</CheckItem>
							</ul>
						</div>
						<ContactPanel />
					</div>
				</div>
			</section>
		</>
	);
};

export default ContactPage;
