import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Email Analytics | Reloop",
	description:
		"Track email performance with detailed analytics, open rates, click-through rates, and conversion metrics. Make data-driven decisions with Reloop's comprehensive email analytics dashboard.",
	openGraph: {
		title: "Email Analytics | Reloop",
		description:
			"Track email performance with detailed analytics, open rates, click-through rates, and conversion metrics. Make data-driven decisions with Reloop's comprehensive email analytics dashboard.",
		type: "website",
	},
};

const EmailAnalyticsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Email Analytics
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Turn email data into actionable insights. Track performance, optimize
					deliverability, and make data-driven decisions with comprehensive
					analytics that matter.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Free Trial
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

			{/* Key Metrics */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Track What Matters Most
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Monitor key performance indicators with real-time dashboards and
						detailed reports that help you optimize your email strategy.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-xl border border-stroke-soft-100 p-8 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
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
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						</div>
						<h3 className="mb-2 font-semibold text-xl">Open Rates</h3>
						<p className="text-text-sub-600 leading-6">
							Track who opens your emails and when, with detailed open analytics
							across devices and time zones.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
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
									d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
								/>
							</svg>
						</div>
						<h3 className="mb-2 font-semibold text-xl">Click Tracking</h3>
						<p className="text-text-sub-600 leading-6">
							Monitor link clicks, heatmaps, and user engagement patterns to
							optimize your email content.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
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
						<h3 className="mb-2 font-semibold text-xl">Conversion Tracking</h3>
						<p className="text-text-sub-600 leading-6">
							Measure the impact of your emails on business goals with
							conversion tracking and ROI analysis.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
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
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-2 font-semibold text-xl">Real-time Reports</h3>
						<p className="text-text-sub-600 leading-6">
							Get instant insights with live dashboards and automated reports
							delivered to your inbox.
						</p>
					</div>
				</div>
			</section>

			{/* Advanced Analytics */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Advanced Analytics Features
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Go beyond basic metrics with advanced analytics that provide deep
							insights into your email performance.
						</p>
					</div>

					<div className="space-y-12">
						<div className="flex flex-col gap-8 md:flex-row md:items-center">
							<div className="md:w-1/2">
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
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									Segmentation Analytics
								</h3>
								<p className="text-text-sub-600 leading-7">
									Compare performance across different audience segments to
									identify your most engaged subscribers and optimize targeting.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
									<div className="text-4xl">📊</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-8 md:flex-row-reverse md:items-center">
							<div className="md:w-1/2">
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
											d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">Trend Analysis</h3>
								<p className="text-text-sub-600 leading-7">
									Track performance trends over time with historical data and
									predictive analytics to forecast future performance.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-green-900/20 dark:to-emerald-900/20">
									<div className="text-4xl">📈</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-8 md:flex-row md:items-center">
							<div className="md:w-1/2">
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
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									A/B Testing Insights
								</h3>
								<p className="text-text-sub-600 leading-7">
									Analyze A/B test results with statistical significance testing
									and detailed performance comparisons to optimize your email
									strategy.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-8 dark:from-purple-900/20 dark:to-pink-900/20">
									<div className="text-4xl">🧪</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Unlock Your Email Insights?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Start tracking your email performance with Reloop's comprehensive
					analytics. Get detailed insights that help you optimize your email
					strategy and drive better results.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Free Trial
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Analytics Demo
					</Link>
				</div>
			</section>
		</div>
	);
};

export default EmailAnalyticsPage;
