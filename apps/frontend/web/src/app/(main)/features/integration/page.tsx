import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Integration Guide | Reloop",
	description:
		"Integrate Reloop with your applications using our REST API, webhooks, and official SDKs. Complete integration guides for all major programming languages and platforms.",
	openGraph: {
		title: "Integration Guide | Reloop",
		description:
			"Integrate Reloop with your applications using our REST API, webhooks, and official SDKs. Complete integration guides for all major programming languages and platforms.",
		type: "website",
	},
};

const IntegrationPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Integration Guide
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Integrate Reloop into your applications with our comprehensive guides,
					SDKs, and examples. Get up and running in minutes with your preferred
					programming language.
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
						href="/docs/api-reference"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View API Docs
					</Link>
				</div>
			</section>

			{/* Integration Methods */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Choose Your Integration Method
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Multiple ways to integrate Reloop into your applications. Choose the
						method that best fits your development workflow.
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
									d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">REST API</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Use our RESTful API to send emails, manage subscribers, and track
							analytics from any programming language.
						</p>
						<Link
							href="/docs/api-reference"
							className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
						>
							View API Reference →
						</Link>
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
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Official SDKs</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Use our official SDKs for faster integration with built-in error
							handling, retries, and type safety.
						</p>
						<Link
							href="/docs/SDKs"
							className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
						>
							Browse SDKs →
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
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Webhooks</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Receive real-time notifications about email events, delivery
							status, and user interactions.
						</p>
						<Link
							href="/docs/webhooks"
							className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
						>
							Learn About Webhooks →
						</Link>
					</div>
				</div>
			</section>

			{/* Quick Start Examples */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Quick Start Examples
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Get started quickly with these code examples for popular
							programming languages and frameworks.
						</p>
					</div>

					<div className="space-y-8">
						<div className="rounded-xl border border-stroke-soft-100 bg-gray-50 p-8 dark:bg-gray-900">
							<div className="mb-4 flex items-center gap-3">
								<div className="text-2xl">⚡</div>
								<h3 className="font-semibold text-xl">Node.js</h3>
							</div>
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									# Install the SDK
								</div>
								<div className="mt-2">npm install @reloop/sdk</div>
								<div className="mt-4 text-gray-600 dark:text-gray-400">
									# Send an email
								</div>
								<div className="mt-2">
									import {"{"} Reloop {"}"} from '@reloop/sdk';
								</div>
								<div className="mt-2">
									const reloop = new Reloop('YOUR_API_KEY');
								</div>
								<div className="mt-2">await reloop.emails.send({"{"}</div>
								<div className="ml-4">from: 'hello@yourdomain.com',</div>
								<div className="ml-4">to: 'user@example.com',</div>
								<div className="ml-4">subject: 'Hello from Reloop!',</div>
								<div className="ml-4">
									html: '&lt;h1&gt;Hello World!&lt;/h1&gt;'
								</div>
								<div>{"}"});</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 bg-gray-50 p-8 dark:bg-gray-900">
							<div className="mb-4 flex items-center gap-3">
								<div className="text-2xl">🐍</div>
								<h3 className="font-semibold text-xl">Python</h3>
							</div>
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									# Install the SDK
								</div>
								<div className="mt-2">pip install reloop</div>
								<div className="mt-4 text-gray-600 dark:text-gray-400">
									# Send an email
								</div>
								<div className="mt-2">import reloop</div>
								<div className="mt-2">
									client = reloop.Client('YOUR_API_KEY')
								</div>
								<div className="mt-2">client.emails.send({"{"}</div>
								<div className="ml-4">'from': 'hello@yourdomain.com',</div>
								<div className="ml-4">'to': 'user@example.com',</div>
								<div className="ml-4">'subject': 'Hello from Reloop!',</div>
								<div className="ml-4">
									'html': '&lt;h1&gt;Hello World!&lt;/h1&gt;'
								</div>
								<div>{"}"})</div>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 bg-gray-50 p-8 dark:bg-gray-900">
							<div className="mb-4 flex items-center gap-3">
								<div className="text-2xl">🌐</div>
								<h3 className="font-semibold text-xl">cURL</h3>
							</div>
							<div className="font-mono text-sm">
								<div className="text-gray-600 dark:text-gray-400">
									# Send an email via REST API
								</div>
								<div className="mt-2">
									curl -X POST https://api.reloop.com/v1/emails \
								</div>
								<div className="ml-4">
									-H "Authorization: Bearer YOUR_API_KEY" \
								</div>
								<div className="ml-4">
									-H "Content-Type: application/json" \
								</div>
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
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Ready to Integrate?</h2>
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

export default IntegrationPage;
