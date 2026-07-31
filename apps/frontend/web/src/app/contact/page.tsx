import { JsonLd } from "@reloop/web/components/json-ld";
import { contactEmail, defaultOgImage, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ContactPanel } from "./contact-form";

function CheckItem({ children }: { children: React.ReactNode }) {
	return (
		<li className="flex items-start gap-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/55">
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

const seoDescription =
	"Get help from the engineers who built Reloop. Start a live chat, configure self-hosting or SMTP, and debug API delivery. Typically reply in 2-3 minutes.";

export const metadata: Metadata = {
	title: "Get help from the engineers who built it | Reloop",
	description: seoDescription,
	keywords: [
		"contact Reloop",
		"Reloop support",
		"email platform support",
		"Reloop Labs help",
		"open source email support",
		"SMTP support",
		"self-hosted email support",
	],
	openGraph: {
		title: "Get help from the engineers who built it | Reloop",
		description: seoDescription,
		type: "website",
		url: contactPageUrl,
		siteName: "Reloop",
		images: [
			{
				url: `${siteUrl}/contact/opengraph-image`,
				width: 1200,
				height: 630,
				alt: "Contact Us | Reloop",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Get help from the engineers who built it | Reloop",
		description: seoDescription,
		images: [`${siteUrl}/contact/opengraph-image`],
	},
	alternates: {
		canonical: contactPageUrl,
	},
};

const contactPageSchema = {
	"@context": "https://schema.org",
	"@type": "ContactPage",
	name: "Get help from the engineers who built it | Reloop",
	description: seoDescription,
	url: contactPageUrl,
	mainEntity: {
		"@type": "Organization",
		name: "Reloop Labs",
		url: siteUrl,
		logo: `${siteUrl}${defaultOgImage}`,
		email: contactEmail,
	},
};

const ContactPage = () => {
	return (
		<>
			<JsonLd data={contactPageSchema} />
			<div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col border-stroke-soft-200 border-x pt-16 pb-16 md:max-w-7xl dark:border-white/10">
				<section className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
					<div className="mx-auto grid w-full max-w-4xl items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
						<div className="min-w-0">
							<h1 className="font-serif text-[1.85rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.25rem] lg:text-[2.5rem] dark:text-white">
								Get help from the engineers who built it
							</h1>
							<p className="mt-4 text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/55">
								We&apos;re online and typically reply in 2 to 3 minutes.
							</p>
							<ul className="mt-6 space-y-3.5 sm:mt-8 sm:space-y-4">
								<CheckItem>Get help setting up self-hosting or SMTP</CheckItem>
								<CheckItem>
									Debug deliverability or API integration issues
								</CheckItem>
								<CheckItem>
									Share feedback and feature requests directly
								</CheckItem>
							</ul>
						</div>
						<div className="min-w-0 lg:pt-1">
							<ContactPanel />
						</div>
					</div>
				</section>
			</div>
		</>
	);
};

export default ContactPage;
