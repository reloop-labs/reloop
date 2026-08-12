import { Icon } from "@reloop/ui/icon";
import { JsonLd } from "@reloop/web/components/json-ld";
import { contactEmail, defaultOgImage, getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { ContactPanel } from "./contact-form";

function BenefitItem({ children }: { children: React.ReactNode }) {
	return (
		<li className="flex gap-3.5 text-[14px] text-text-strong-950 leading-relaxed sm:text-[15px] dark:text-white">
			<span
				className="mt-[0.35em] h-4 w-px shrink-0 bg-text-strong-950/25 dark:bg-white/25"
				aria-hidden="true"
			/>
			<span className="min-w-0 text-text-sub-600 dark:text-white/65">
				{children}
			</span>
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
			{/*
			  Attio-style split: left marketing column (white) + right chat panel (soft tint).
			  Content is unchanged; only layout + visual hierarchy.
			*/}
			<div className="w-full bg-white dark:bg-black">
				<div className="mx-auto grid w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl lg:grid-cols-2 dark:border-white/10">
					{/* ── Left: copy ── */}
					<section className="relative flex flex-col border-stroke-soft-200 px-6 pt-28 pb-10 sm:px-10 sm:pt-32 sm:pb-12 lg:border-r lg:px-12 lg:pt-36 lg:pb-14 xl:px-16 dark:border-white/10">
						<div className="mx-auto w-full max-w-md lg:mx-0">
							<h1 className="font-semibold text-[1.85rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[2.15rem] lg:text-[2.35rem] dark:text-white">
								Get help from the engineers who built it.
							</h1>
							<p className="mt-4 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
								We&apos;re online and typically reply in 2 to 3 minutes.
							</p>

							<ul className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
								<BenefitItem>
									Get help setting up self-hosting or SMTP
								</BenefitItem>
								<BenefitItem>
									Debug deliverability or API integration issues
								</BenefitItem>
								<BenefitItem>
									Share feedback and feature requests directly
								</BenefitItem>
							</ul>

							{/* Contact details sit under the list — not pinned to the bottom */}
							<div className="mt-8 space-y-3 sm:mt-10">
								<div className="flex items-center gap-2.5">
									<Icon
										name="mail-single"
										className="size-4 shrink-0 text-text-sub-600 dark:text-white/50"
									/>
									<a
										href={`mailto:${contactEmail}`}
										className="font-medium text-[13px] text-text-sub-600 underline decoration-text-sub-600/30 underline-offset-2 transition-colors hover:text-text-strong-950 hover:decoration-text-strong-950 dark:text-white/50 dark:decoration-white/25 dark:hover:text-white dark:hover:decoration-white"
									>
										{contactEmail}
									</a>
								</div>
								<div className="flex items-center gap-2.5">
									<svg
										className="size-4 shrink-0 text-text-sub-600 dark:text-white/50"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden
									>
										<rect
											opacity="0.12"
											x="5"
											y="2"
											width="14"
											height="20"
											rx="4"
											fill="currentColor"
										/>
										<path
											d="M12 6H12.01M10 19H14M12.5 6C12.5 6.27614 12.2761 6.5 12 6.5C11.7239 6.5 11.5 6.27614 11.5 6C11.5 5.72386 11.7239 5.5 12 5.5C12.2761 5.5 12.5 5.72386 12.5 6ZM11.4 22H12.6C14.8402 22 15.9603 22 16.816 21.564C17.5686 21.1805 18.1805 20.5686 18.564 19.816C19 18.9603 19 17.8402 19 15.6V8.4C19 6.15979 19 5.03968 18.564 4.18404C18.1805 3.43139 17.5686 2.81947 16.816 2.43597C15.9603 2 14.8402 2 12.6 2H11.4C9.15979 2 8.03968 2 7.18404 2.43597C6.43139 2.81947 5.81947 3.43139 5.43597 4.18404C5 5.03968 5 6.15979 5 8.4V15.6C5 17.8402 5 18.9603 5.43597 19.816C5.81947 20.5686 6.43139 21.1805 7.18404 21.564C8.03968 22 9.15979 22 11.4 22Z"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
									<a
										href="tel:+917411367725"
										className="font-medium text-[13px] text-text-sub-600 underline decoration-text-sub-600/30 underline-offset-2 transition-colors hover:text-text-strong-950 hover:decoration-text-strong-950 dark:text-white/50 dark:decoration-white/25 dark:hover:text-white dark:hover:decoration-white"
									>
										+91 7411367725
									</a>
								</div>
								<p className="pt-1 text-[13px] text-text-soft-400 leading-relaxed dark:text-white/35">
									Chat goes straight to the founders — whoever is free jumps in.
								</p>
							</div>
						</div>
					</section>

					{/* ── Right: chat panel ── */}
					<section className="relative flex flex-col bg-bg-weak-50/80 pt-16 pb-0 dark:bg-white/[0.02]">
						<div className="flex h-full w-full flex-col">
							<ContactPanel />
						</div>
					</section>
				</div>
			</div>
		</>
	);
};

export default ContactPage;
