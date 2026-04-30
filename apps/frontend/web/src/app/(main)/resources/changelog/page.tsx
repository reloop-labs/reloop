import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Changelog | Reloop",
	description:
		"Stay updated with the latest Reloop features, improvements, and bug fixes. Track our development progress and see what's new in each release.",
	openGraph: {
		title: "Changelog | Reloop",
		description:
			"Stay updated with the latest Reloop features, improvements, and bug fixes. Track our development progress and see what's new in each release.",
		type: "website",
	},
};

const ChangelogPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Changelog
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Stay updated with the latest Reloop features, improvements, and bug
					fixes. Track our development progress and see what's new in each
					release.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started
					</Link>
					<Link
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Documentation
					</Link>
				</div>
			</section>

			{/* Latest Release */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Latest Release</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							See what's new in our latest version and stay up to date with our
							development progress.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded bg-blue-600 px-3 py-1 font-semibold text-sm text-white">
								v1.2.0
							</div>
							<span className="text-sm text-text-sub-600">
								Released on December 15, 2024
							</span>
						</div>
						<h3 className="mb-4 font-semibold text-2xl">
							Major Feature Release
						</h3>
						<p className="mb-6 text-text-sub-600 leading-7">
							This release introduces advanced analytics, improved
							deliverability, and enhanced developer experience with new SDKs
							and better documentation.
						</p>

						<div className="space-y-4">
							<div>
								<h4 className="mb-2 font-semibold text-green-700 text-lg dark:text-green-400">
									✨ New Features
								</h4>
								<ul className="space-y-2 text-sm text-text-sub-600">
									<li>• Advanced email analytics with real-time dashboards</li>
									<li>• A/B testing for email campaigns</li>
									<li>• New Python and Go SDKs</li>
									<li>• Webhook signature verification</li>
									<li>• Email template library with 50+ templates</li>
								</ul>
							</div>

							<div>
								<h4 className="mb-2 font-semibold text-blue-700 text-lg dark:text-blue-400">
									🚀 Improvements
								</h4>
								<ul className="space-y-2 text-sm text-text-sub-600">
									<li>• 40% faster email delivery times</li>
									<li>• Enhanced mobile responsiveness</li>
									<li>• Improved error handling in SDKs</li>
									<li>• Better documentation with examples</li>
									<li>• Reduced API response times by 60%</li>
								</ul>
							</div>

							<div>
								<h4 className="mb-2 font-semibold text-lg text-orange-700 dark:text-orange-400">
									🐛 Bug Fixes
								</h4>
								<ul className="space-y-2 text-sm text-text-sub-600">
									<li>• Fixed webhook delivery issues</li>
									<li>• Resolved template rendering problems</li>
									<li>• Fixed SDK authentication edge cases</li>
									<li>• Corrected analytics data inconsistencies</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Previous Releases */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Previous Releases</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Browse through our release history to see how Reloop has evolved
							over time.
						</p>
					</div>

					<div className="space-y-8">
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded bg-green-600 px-3 py-1 font-semibold text-sm text-white">
									v1.1.0
								</div>
								<span className="text-sm text-text-sub-600">
									Released on November 20, 2024
								</span>
							</div>
							<h3 className="mb-3 font-semibold text-xl">
								Webhooks & Integration Improvements
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Added comprehensive webhook support, improved API performance,
								and enhanced integration capabilities.
							</p>
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<h4 className="mb-1 font-semibold text-green-700 text-sm dark:text-green-400">
										New
									</h4>
									<ul className="space-y-1 text-text-sub-600 text-xs">
										<li>• Webhook notifications</li>
										<li>• Node.js SDK</li>
										<li>• Email validation API</li>
									</ul>
								</div>
								<div>
									<h4 className="mb-1 font-semibold text-blue-700 text-sm dark:text-blue-400">
										Improved
									</h4>
									<ul className="space-y-1 text-text-sub-600 text-xs">
										<li>• API response times</li>
										<li>• Error messages</li>
										<li>• Documentation</li>
									</ul>
								</div>
								<div>
									<h4 className="mb-1 font-semibold text-orange-700 text-sm dark:text-orange-400">
										Fixed
									</h4>
									<ul className="space-y-1 text-text-sub-600 text-xs">
										<li>• Template rendering</li>
										<li>• Authentication bugs</li>
										<li>• Rate limiting issues</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded bg-purple-600 px-3 py-1 font-semibold text-sm text-white">
									v1.0.0
								</div>
								<span className="text-sm text-text-sub-600">
									Released on October 15, 2024
								</span>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Initial Release</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								The first stable release of Reloop with core email
								infrastructure features and basic analytics.
							</p>
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<h4 className="mb-1 font-semibold text-green-700 text-sm dark:text-green-400">
										Features
									</h4>
									<ul className="space-y-1 text-text-sub-600 text-xs">
										<li>• Email sending API</li>
										<li>• Basic analytics</li>
										<li>• Template system</li>
										<li>• User dashboard</li>
									</ul>
								</div>
								<div>
									<h4 className="mb-1 font-semibold text-blue-700 text-sm dark:text-blue-400">
										Infrastructure
									</h4>
									<ul className="space-y-1 text-text-sub-600 text-xs">
										<li>• 99.9% uptime SLA</li>
										<li>• Global CDN</li>
										<li>• Security compliance</li>
									</ul>
								</div>
								<div>
									<h4 className="mb-1 font-semibold text-orange-700 text-sm dark:text-orange-400">
										Support
									</h4>
									<ul className="space-y-1 text-text-sub-600 text-xs">
										<li>• REST API</li>
										<li>• Basic documentation</li>
										<li>• Email support</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Roadmap */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">What's Coming Next</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Here's what we're working on for future releases. Your feedback
							helps us prioritize features.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="rounded-xl border border-stroke-soft-100 p-8">
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
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">v1.3.0 - Q1 2025</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Advanced automation features and enhanced developer tools.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• Email automation workflows</li>
								<li>• Advanced segmentation</li>
								<li>• Custom domain support</li>
								<li>• Enhanced API rate limits</li>
							</ul>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
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
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">v2.0.0 - Q2 2025</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Major platform update with enterprise features and self-hosting.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• Self-hosting capabilities</li>
								<li>• Enterprise SSO integration</li>
								<li>• Advanced compliance tools</li>
								<li>• Multi-tenant architecture</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Stay Updated</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Get notified about new releases and updates. Follow our development
					progress and be the first to try new features.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started
					</Link>
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						Follow on GitHub
					</a>
				</div>
			</section>
		</div>
	);
};

export default ChangelogPage;
