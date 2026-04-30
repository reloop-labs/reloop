import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Campaign Builder | Reloop",
	description:
		"Visual email campaign builder with drag-and-drop editor, templates, and automation. Create stunning campaigns without coding using Reloop's intuitive campaign builder.",
	openGraph: {
		title: "Campaign Builder | Reloop",
		description:
			"Visual email campaign builder with drag-and-drop editor, templates, and automation. Create stunning campaigns without coding using Reloop's intuitive campaign builder.",
		type: "website",
	},
};

const CampaignBuilderPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Campaign Builder
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Create stunning email campaigns with our visual drag-and-drop editor.
					No coding required—just drag, drop, and customize to build campaigns
					that convert.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Building
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Demo
					</Link>
				</div>
			</section>

			{/* Builder Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Powerful Visual Editor
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Build professional email campaigns with our intuitive drag-and-drop
						editor. Everything you need to create, customize, and send
						high-converting emails.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
							<svg
								className="h-6 w-6 text-blue-600 dark:text-blue-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Drag & Drop Editor</h3>
						<p className="text-text-sub-600 leading-6">
							Build emails visually with our intuitive drag-and-drop editor. Add
							text, images, buttons, and more with simple clicks and drags.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
							<svg
								className="h-6 w-6 text-green-600 dark:text-green-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Template Library</h3>
						<p className="text-text-sub-600 leading-6">
							Choose from hundreds of professionally designed templates for
							every use case. Customize them to match your brand perfectly.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
							<svg
								className="h-6 w-6 text-purple-600 dark:text-purple-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Mobile Responsive</h3>
						<p className="text-text-sub-600 leading-6">
							All campaigns are automatically optimized for mobile devices.
							Preview and test across different screen sizes.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
							<svg
								className="h-6 w-6 text-orange-600 dark:text-orange-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Real-time Preview</h3>
						<p className="text-text-sub-600 leading-6">
							See your changes instantly with live preview. Test how your
							campaign looks across different email clients and devices.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20">
							<svg
								className="h-6 w-6 text-pink-600 dark:text-pink-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Brand Customization</h3>
						<p className="text-text-sub-600 leading-6">
							Customize colors, fonts, and layouts to match your brand identity.
							Save brand presets for consistent styling.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
							<svg
								className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">A/B Testing</h3>
						<p className="text-text-sub-600 leading-6">
							Test different versions of your campaigns to optimize performance.
							Built-in A/B testing with statistical significance.
						</p>
					</div>
				</div>
			</section>

			{/* Workflow */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Simple Campaign Workflow
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							From design to delivery, our campaign builder streamlines every
							step of the email marketing process.
						</p>
					</div>

					<div className="space-y-8">
						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
								1
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">Choose Template</h3>
								<p className="text-text-sub-600 leading-7">
									Start with a professionally designed template from our
									library, or begin with a blank canvas to create your own
									design from scratch.
								</p>
							</div>
						</div>

						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
								2
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">Customize Design</h3>
								<p className="text-text-sub-600 leading-7">
									Use our drag-and-drop editor to customize every element. Add
									your content, images, and branding to create the perfect
									campaign.
								</p>
							</div>
						</div>

						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
								3
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">Set Up Audience</h3>
								<p className="text-text-sub-600 leading-7">
									Define your target audience using our segmentation tools.
									Create dynamic lists based on behavior, preferences, and
									demographics.
								</p>
							</div>
						</div>

						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white">
								4
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">Schedule & Send</h3>
								<p className="text-text-sub-600 leading-7">
									Schedule your campaign for the optimal time or send
									immediately. Track performance with detailed analytics and
									insights.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Build Your First Campaign?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Start creating stunning email campaigns with Reloop's visual campaign
					builder. No coding required—just drag, drop, and send.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Building
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Try Campaign Builder
					</Link>
				</div>
			</section>
		</div>
	);
};

export default CampaignBuilderPage;
