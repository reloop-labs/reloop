import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Free Email Tools | Reloop",
	description:
		"Free email tools and utilities for developers and marketers. Email validators, deliverability testers, template generators, and more to optimize your email campaigns.",
	openGraph: {
		title: "Free Email Tools | Reloop",
		description:
			"Free email tools and utilities for developers and marketers. Email validators, deliverability testers, template generators, and more to optimize your email campaigns.",
		type: "website",
	},
};

const ToolsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Free Email Tools
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Powerful email tools and utilities to optimize your campaigns. From
					validation to deliverability testing, everything you need to succeed
					with email marketing.
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

			{/* Tools Grid */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">Essential Email Tools</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Free tools to help you validate, test, and optimize your email
						campaigns. No registration required.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Email Validator</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Validate email addresses in real-time. Check syntax, domain
							validity, and deliverability with 99.9% accuracy.
						</p>
						<div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-900">
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									Enter email to validate:
								</div>
								<div className="mt-2 flex gap-2">
									<input
										type="email"
										placeholder="user@example.com"
										className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
									/>
									<button
										type="button"
										className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
									>
										Validate
									</button>
								</div>
							</div>
						</div>
						<Link
							href="/tools/email-validator"
							className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
						>
							Try Email Validator →
						</Link>
					</div>

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
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">
							Deliverability Tester
						</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Test your email's deliverability across major ISPs. Get detailed
							reports on spam score and inbox placement.
						</p>
						<div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-900">
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									Spam Score: <span className="text-green-600">2/100</span>
								</div>
								<div className="text-gray-600 dark:text-gray-400">
									Inbox Placement: <span className="text-green-600">98%</span>
								</div>
								<div className="text-gray-600 dark:text-gray-400">
									Authentication: <span className="text-green-600">Passed</span>
								</div>
							</div>
						</div>
						<Link
							href="/tools/deliverability-tester"
							className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Test Deliverability →
						</Link>
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
									d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Template Generator</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Create responsive email templates with our drag-and-drop
							generator. Export HTML or use directly in your campaigns.
						</p>
						<div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-900">
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									Template Types:
								</div>
								<div className="mt-1 text-sm">• Newsletter</div>
								<div className="text-sm">• Transactional</div>
								<div className="text-sm">• Marketing</div>
								<div className="text-sm">• Welcome</div>
							</div>
						</div>
						<Link
							href="/tools/template-generator"
							className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
						>
							Create Template →
						</Link>
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
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">
							Authentication Checker
						</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Verify SPF, DKIM, and DMARC records for your domain. Ensure proper
							email authentication setup.
						</p>
						<div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-900">
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									Domain: example.com
								</div>
								<div className="mt-1 text-sm">
									SPF: <span className="text-green-600">✓ Valid</span>
								</div>
								<div className="text-sm">
									DKIM: <span className="text-green-600">✓ Valid</span>
								</div>
								<div className="text-sm">
									DMARC: <span className="text-green-600">✓ Valid</span>
								</div>
							</div>
						</div>
						<Link
							href="/tools/auth-checker"
							className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
						>
							Check Authentication →
						</Link>
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
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Subject Line Tester</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Test and optimize your email subject lines. Get suggestions for
							better open rates and engagement.
						</p>
						<div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-900">
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									Subject: "Special Offer Inside!"
								</div>
								<div className="mt-1 text-sm">
									Score: <span className="text-green-600">85/100</span>
								</div>
								<div className="text-sm">
									Length: <span className="text-green-600">Good</span>
								</div>
							</div>
						</div>
						<Link
							href="/tools/subject-tester"
							className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
						>
							Test Subject Line →
						</Link>
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
									d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Mobile Preview</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Preview your emails across different devices and email clients.
							Ensure perfect rendering everywhere.
						</p>
						<div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-900">
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									Tested Clients:
								</div>
								<div className="mt-1 text-sm">• Gmail</div>
								<div className="text-sm">• Outlook</div>
								<div className="text-sm">• Apple Mail</div>
								<div className="text-sm">• Mobile</div>
							</div>
						</div>
						<Link
							href="/tools/mobile-preview"
							className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
						>
							Preview Email →
						</Link>
					</div>
				</div>
			</section>

			{/* API Tools */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">API Tools</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Integrate our tools directly into your applications with our
							powerful APIs. Build custom solutions with our validation and
							testing endpoints.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-4 font-semibold text-xl">Validation API</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Validate email addresses programmatically with our REST API.
								Perfect for form validation and list cleaning.
							</p>
							<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
								<div className="text-gray-600 dark:text-gray-400">
									POST /api/v1/validate
								</div>
								<div className="mt-2">{"{"}</div>
								<div className="ml-4">"email": "user@example.com"</div>
								<div>{"}"}</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-4 font-semibold text-xl">Deliverability API</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Test email deliverability and get detailed reports via API.
								Integrate into your email workflow.
							</p>
							<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
								<div className="text-gray-600 dark:text-gray-400">
									POST /api/v1/test-deliverability
								</div>
								<div className="mt-2">{"{"}</div>
								<div className="ml-4">
									"html": "&lt;html&gt;...&lt;/html&gt;",
								</div>
								<div className="ml-4">"subject": "Test Email"</div>
								<div>{"}"}</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Optimize Your Emails?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Use our free tools to improve your email campaigns, then upgrade to
					Reloop for advanced features and unlimited usage.
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
					<Link
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View API Docs
					</Link>
				</div>
			</section>
		</div>
	);
};

export default ToolsPage;
