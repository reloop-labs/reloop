import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { contactEmail, defaultOgImage, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

const checklist = [
	"Get help setting up self-hosting or SMTP",
	"Debug deliverability or API integration issues",
	"Share feedback and feature requests directly",
];

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const contactPageUrl = `${siteUrl}/contact`;

const seoDescription =
	"Contact the engineers who built Reloop. Send a message about self-hosting, SMTP, or API delivery. Typically reply within 2 business days.";

export const metadata: Metadata = {
	title: "Get help from the engineers who built it",
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
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div aria-hidden className="h-[72px] max-[1279px]:h-14" />
				<section className="border-stroke-soft-100 border-y dark:border-white/10">
					<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 lg:grid-cols-[1fr_1fr] lg:divide-x lg:divide-y-0 dark:divide-white/10">
						{/* Left: pitch column */}
						<div className="flex w-full min-w-0 flex-col px-6 py-10 sm:px-10 sm:py-12 lg:p-12 xl:p-16">
							<h1 className="text-balance font-semibold text-[30px] text-text-strong-950 leading-tight tracking-tight dark:text-white">
								Get help from the engineers who built it.
							</h1>
							<p className="mt-4 text-balance text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
								Fill out the form and we&apos;ll get back to you within 2
								business days.
							</p>
							<ul className="mt-8 space-y-3">
								{checklist.map((item) => (
									<li key={item} className="flex items-center gap-3">
										<Icon
											name="check-circle"
											className="size-4 shrink-0 text-emerald-600 dark:text-emerald-500"
										/>
										<span className="text-[14px] text-text-strong-950 dark:text-white/85">
											{item}
										</span>
									</li>
								))}
							</ul>
							<div className="mt-10 space-y-5 *:space-y-1.5">
								<div>
									<h2 className="text-[14px] text-text-sub-600 dark:text-white/55">
										Email
									</h2>
									<a
										className="font-medium text-[14px] text-text-strong-950 hover:underline dark:text-white"
										href={`mailto:${contactEmail}`}
									>
										{contactEmail}
									</a>
								</div>
								<div>
									<h2 className="text-[14px] text-text-sub-600 dark:text-white/55">
										Phone
									</h2>
									<a
										className="font-medium text-[14px] text-text-strong-950 hover:underline dark:text-white"
										href="tel:+917411367725"
									>
										+91 7411367725
									</a>
								</div>
								<div>
									<h2 className="text-[14px] text-text-sub-600 dark:text-white/55">
										Response time
									</h2>
									<p className="font-medium text-[14px] text-text-strong-950 dark:text-white">
										Within 2 business days
									</p>
								</div>
							</div>
						</div>

						{/* Right: form */}
						<div className="min-w-0 px-6 py-10 sm:px-10 sm:py-12 lg:p-12 xl:p-16">
							<ContactForm />
						</div>
					</div>
				</section>
			</div>

			<BlogCta
				headline="Need dedicated help or custom setup?"
				sub="Whether you're migrating high-volume sending, configuring custom SMTP routing, or setting up self-hosted infrastructure, our founders and engineers are here to help."
				primaryLabel="Email founders"
				primaryHref={`mailto:${contactEmail}`}
				primaryExternal
				secondaryLabel="Join Discord"
				secondaryHref="https://discord.gg/ZBYwWKY96U"
				secondaryExternal
				accentColor="blue"
			/>
		</>
	);
};

export default ContactPage;
