import * as Button from "@reloop/ui/button";
import Link from "next/link";

const MarketingTeamsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Collaborative Email Marketing & Campaigns
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Bring designers, copywriters, and developers into one workspace.
					Design beautiful newsletters, manage broadcasts, and optimize conversions with AI assistance.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Create a Campaign
					</Link>
					<Link
						href="/contact"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Book a Demo
					</Link>
				</div>
			</section>

			{/* Core Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Everything Your Team Needs
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Stop editing code in isolation. Build, verify, and broadcast together.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{/* Card 1 */}
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
									d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">AI-Powered Templates</h3>
						<p className="text-text-sub-600 leading-6">
							Generate highly engaging newsletter layouts, subject lines, and copy 
							from plain text prompts. Customize with safe dynamic tags.
						</p>
					</div>

					{/* Card 2 */}
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
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Live Team Editor</h3>
						<p className="text-text-sub-600 leading-6">
							Collaborate without friction. Build templates in real-time, see instant previews 
							on multiple screens, and review modifications before deploying.
						</p>
					</div>

					{/* Card 3 */}
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
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Broadcast Analytics</h3>
						<p className="text-text-sub-600 leading-6">
							Scale campaigns with audience segmentation, visual performance reports, 
							automated open-rate optimizations, and deliverability monitoring.
						</p>
					</div>
				</div>
			</section>

			{/* Marketing Metrics */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">
						Drive Engagement and Growth
					</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						Achieve high delivery rates and conversion scores across all global ISP routes.
					</p>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								99.8%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Inbox Placement
							</div>
							<div className="text-sm text-text-sub-600">
								Consistently avoid the spam folder
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								3x
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Faster Drafts
							</div>
							<div className="text-sm text-text-sub-600">
								Using AI template suggestions
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								&lt;0.05%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Bounce Score
							</div>
							<div className="text-sm text-text-sub-600">
								Aggressive automated list sanitation
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-orange-600 dark:text-orange-400">
								24/7
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Live Insights
							</div>
							<div className="text-sm text-text-sub-600">
								Track real-time click and conversion metrics
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to launch your next campaign?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Bring copywriters, designers, and developers together on Reloop today.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started Free
					</Link>
					<Link
						href="/contact"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Contact Our Sales Team
					</Link>
				</div>
			</section>
		</div>
	);
};

export default MarketingTeamsPage;
