import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "API Reference | Reloop",
	description:
		"Complete REST API documentation for Reloop email infrastructure. Authentication, endpoints, webhooks, and SDKs for all programming languages.",
	openGraph: {
		title: "API Reference | Reloop",
		description:
			"Complete REST API documentation for Reloop email infrastructure. Authentication, endpoints, webhooks, and SDKs for all programming languages.",
		type: "website",
	},
};

const ApiReferencePage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					API Reference
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Complete REST API documentation for Reloop. Send emails, manage
					subscribers, track analytics, and integrate with your applications
					using our powerful API.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get API Key
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Try API Explorer
					</Link>
				</div>
			</section>

			{/* Quick Start */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">Quick Start</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Get started with the Reloop API in minutes. Here's everything you
						need to send your first email.
					</p>
				</div>

				<div className="mx-auto max-w-4xl">
					<div className="rounded-xl border border-stroke-soft-100 bg-gray-50 p-8 dark:bg-gray-900">
						<div className="mb-4 flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span className="font-mono text-green-600 text-sm dark:text-green-400">
								Authentication
							</span>
						</div>
						<div className="mb-6 font-mono text-sm">
							<div className="text-gray-600 dark:text-gray-400">
								# Add your API key to the Authorization header
							</div>
							<div className="mt-2">
								curl -H "Authorization: Bearer YOUR_API_KEY" \
							</div>
						</div>

						<div className="mb-4 flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-blue-500" />
							<span className="font-mono text-blue-600 text-sm dark:text-blue-400">
								Send Email
							</span>
						</div>
						<div className="font-mono text-sm">
							<div className="text-gray-600 dark:text-gray-400">
								# Send your first email
							</div>
							<div className="mt-2">
								curl -X POST https://api.reloop.com/v1/emails \
							</div>
							<div className="ml-4">-H "Content-Type: application/json" \</div>
							<div className="ml-4">-d '{"{"}</div>
							<div className="ml-8">"from": "hello@yourdomain.com",</div>
							<div className="ml-8">"to": "user@example.com",</div>
							<div className="ml-8">"subject": "Hello from Reloop!",</div>
							<div className="ml-8">
								"html": "&lt;h1&gt;Hello World!&lt;/h1&gt;"
							</div>
							<div className="ml-4">{"}"}'</div>
						</div>
					</div>
				</div>
			</section>

			{/* API Endpoints */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">Core API Endpoints</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Powerful endpoints for sending emails, managing subscribers, and
						tracking performance with detailed analytics.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2">
					<div className="rounded-xl border border-stroke-soft-100 p-8">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded bg-green-100 px-2 py-1 font-semibold text-green-800 text-xs dark:bg-green-900/30 dark:text-green-400">
								POST
							</div>
							<code className="font-mono text-sm">/v1/emails</code>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Send Email</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Send transactional and marketing emails with support for HTML,
							plain text, attachments, and advanced personalization.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">
								# Send single email
							</div>
							<div>POST /v1/emails</div>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-800 text-xs dark:bg-blue-900/30 dark:text-blue-400">
								GET
							</div>
							<code className="font-mono text-sm">/v1/emails</code>
						</div>
						<h3 className="mb-3 font-semibold text-xl">List Emails</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Retrieve email history with filtering, pagination, and detailed
							status information for each email sent.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">
								# Get email history
							</div>
							<div>GET /v1/emails?limit=50&status=sent</div>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded bg-purple-100 px-2 py-1 font-semibold text-purple-800 text-xs dark:bg-purple-900/30 dark:text-purple-400">
								GET
							</div>
							<code className="font-mono text-sm">/v1/analytics</code>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Analytics</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Access detailed analytics including open rates, click tracking,
							conversion metrics, and performance insights.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">
								# Get analytics data
							</div>
							<div>GET /v1/analytics?period=30d</div>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8">
						<div className="mb-4 flex items-center gap-3">
							<div className="rounded bg-orange-100 px-2 py-1 font-semibold text-orange-800 text-xs dark:bg-orange-900/30 dark:text-orange-400">
								POST
							</div>
							<code className="font-mono text-sm">/v1/webhooks</code>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Webhooks</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Configure webhooks to receive real-time notifications about email
							events, delivery status, and user interactions.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">
								# Configure webhook
							</div>
							<div>POST /v1/webhooks</div>
						</div>
					</div>
				</div>
			</section>

			{/* SDKs */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Official SDKs</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Use our official SDKs to integrate Reloop into your applications
							quickly and easily. Available for all major programming languages.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
							<div className="mb-4 text-4xl">⚡</div>
							<h3 className="mb-2 font-semibold text-lg">Node.js</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Official Node.js SDK with TypeScript support
							</p>
							<code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
								npm install @reloop/sdk
							</code>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
							<div className="mb-4 text-4xl">🐍</div>
							<h3 className="mb-2 font-semibold text-lg">Python</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Python SDK with async support
							</p>
							<code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
								pip install reloop
							</code>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
							<div className="mb-4 text-4xl">☕</div>
							<h3 className="mb-2 font-semibold text-lg">Java</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Java SDK with Spring Boot integration
							</p>
							<code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
								implementation 'com.reloop:sdk'
							</code>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
							<div className="mb-4 text-4xl">🦀</div>
							<h3 className="mb-2 font-semibold text-lg">Rust</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								High-performance Rust SDK
							</p>
							<code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
								reloop = "1.0"
							</code>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
							<div className="mb-4 text-4xl">🐹</div>
							<h3 className="mb-2 font-semibold text-lg">Go</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Go SDK with goroutine support
							</p>
							<code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
								go get github.com/reloop/sdk-go
							</code>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
							<div className="mb-4 text-4xl">🐘</div>
							<h3 className="mb-2 font-semibold text-lg">PHP</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								PHP SDK with Composer support
							</p>
							<code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
								composer require reloop/sdk
							</code>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Start Building?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Get your API key and start integrating Reloop into your applications
					today. Comprehensive documentation and examples make integration
					simple.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get API Key
					</Link>
					<Link
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Full Docs
					</Link>
				</div>
			</section>
		</div>
	);
};

export default ApiReferencePage;
