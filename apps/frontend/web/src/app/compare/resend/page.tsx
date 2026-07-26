import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { competitorBrands } from "../competitor-brands";
import {
	CompareFeatureSlide,
	type CompareFeatureSlideItem,
} from "../components/compare-feature-slide";
import { CompareMigrate } from "../components/compare-migrate";
import { CompareOtherLinks } from "../components/compare-other-links";
import { CompareSection } from "../components/compare-section";
import { ComparisonMatrix } from "../components/comparison-matrix";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { resendComparisonCategories } from "./comparison-data";

/** Important product surfaces — temp mock UIs until real screenshots land. */
const resendFeatureSlides: CompareFeatureSlideItem[] = [
	{
		id: "sending",
		label: "Sending",
		reloopCaption: "Reloop · transactional send",
		competitorCaption: "Resend · transactional send",
	},
	{
		id: "inbox",
		label: "Agent inbox",
		reloopCaption: "Reloop · two-way agent inbox",
		competitorCaption: "Resend · inbound",
	},
	{
		id: "templates",
		label: "Templates",
		reloopCaption: "Reloop · template editor",
		competitorCaption: "Resend · templates",
	},
	{
		id: "webhooks",
		label: "Webhooks",
		reloopCaption: "Reloop · delivery events",
		competitorCaption: "Resend · webhooks",
	},
	{
		id: "self-host",
		label: "Self-host",
		reloopCaption: "Reloop · self-hosted stack",
		competitorCaption: "Resend · hosted only",
	},
	{
		id: "domains",
		label: "Domains",
		reloopCaption: "Reloop · domain auth",
		competitorCaption: "Resend · domains",
	},
];

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/resend";
const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}${pagePath}`;

const resendBrand = competitorBrands.find((b) => b.name === "Resend");

export const metadata: Metadata = {
	title: "Reloop vs Resend: a detailed comparison",
	description:
		"Learn how Reloop compares to Resend and why Reloop is the best Resend alternative for all your developer email needs.",
	keywords: [
		"Reloop vs Resend",
		"Resend alternative",
		"Resend comparison",
		"open source Resend alternative",
		"self-hosted email API",
		"KumoMTA email",
	],
	openGraph: {
		title: "Reloop vs Resend",
		description:
			"Learn how Reloop compares to Resend and why Reloop is the best Resend alternative for all your developer email needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Resend: a detailed comparison",
		description:
			"Learn how Reloop compares to Resend and why Reloop is the best Resend alternative for all your developer email needs.",
	},
	alternates: { canonical: pageUrl },
};

const ResendComparisonPage = () => {
	return (
		<ComparisonPageShell
			pagePath={pagePath}
			titleLines={["Reloop vs Resend"]}
			description="Learn how Reloop compares to Resend and why Reloop is the best Resend alternative for all your developer email needs."
			primaryCta={{
				label: "Start for free",
				href: "/dashboard/signup",
			}}
			secondaryCta={{
				label: "Migrate from Resend",
				href: "/compare/resend#migrate",
			}}
		>
			{/* Product UI slide comparison */}
			<CompareSection maxWidth="5xl" flushTop>
				<h2 className="mx-auto mb-10 max-w-3xl text-balance text-center font-serif text-[2rem] text-text-strong-950 leading-[1.15] tracking-tighter sm:mb-12 sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
					Reloop is the open-source email infrastructure built for the age of AI
					agents.
				</h2>
				{resendBrand ? (
					<CompareFeatureSlide
						competitorName="Resend"
						competitorIcon={resendBrand.icon}
						features={resendFeatureSlides}
					/>
				) : null}
			</CompareSection>

			{/* Feature matrix */}
			<CompareSection maxWidth="3xl">
				<div className="mb-10 text-center">
					<h2 className="mt-3 font-serif text-[2rem] text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.4rem] lg:text-[2.8rem] dark:text-white">
						Reloop &nbsp;&nbsp;vs&nbsp;&nbsp;&nbsp;{resendBrand?.name}
					</h2>
					<p className="mx-auto mt-3 max-w-xl font-medium text-[15px] text-text-sub-600 leading-7 sm:text-[17px] dark:text-white/50">
						Reloop is the #1 open-source alternative to{" "}
						{resendBrand?.name || "Resend"}.
						<br /> With Reloop, get everything you need sending, receiving, AI
						templates, and agent inboxes at a fraction of the cost.
					</p>
				</div>
				<ComparisonMatrix
					competitorName="Resend"
					categories={resendComparisonCategories}
				/>
				<p className="mt-6 text-center text-[13px] text-text-sub-600 dark:text-white/40">
					Seen something inaccurate?{" "}
					<Link href="/contact" className="font-semibold text-primary-base">
						Tell us
					</Link>
					—we correct comparison pages when the facts change.
				</p>
			</CompareSection>

			{/* Migration — Dub-style 3-step cards */}
			<CompareSection maxWidth="full">
				{resendBrand ? (
					<CompareMigrate
						competitorName="Resend"
						competitorIcon={resendBrand.icon}
						primaryHref="/dashboard/signup"
						guideHref="/docs"
					/>
				) : null}
				<p className="mx-auto mt-10 max-w-2xl px-4 text-center text-[14px] text-text-sub-600 dark:text-white/50">
					Details in the{" "}
					<Link href="/docs" className="font-semibold text-primary-base">
						API docs
					</Link>{" "}
					and{" "}
					<Link
						href="/features/smtp"
						className="font-semibold text-primary-base"
					>
						SMTP guide
					</Link>
					. Reloop is not a drop-in Resend proxy—plan a small client adapter.
				</p>
			</CompareSection>

			<CompareSection maxWidth="2xl" noDivider>
				<CompareOtherLinks currentHref={pagePath} />
			</CompareSection>
		</ComparisonPageShell>
	);
};

export default ResendComparisonPage;
