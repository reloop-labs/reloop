import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "SDKs | Reloop",
	description:
		"Official Reloop SDKs for all major programming languages. Node.js, Python, Java, Go, Rust, PHP, and more. Get started quickly with type-safe, well-documented SDKs.",
	openGraph: {
		title: "SDKs | Reloop",
		description:
			"Official Reloop SDKs for all major programming languages. Node.js, Python, Java, Go, Rust, PHP, and more. Get started quickly with type-safe, well-documented SDKs.",
		type: "website",
	},
};

const SDKsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Official SDKs
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Integrate Reloop into your applications with our official SDKs.
					Type-safe, well-documented, and available for all major programming
					languages.
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

			{/* SDKs Grid */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">Choose Your Language</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Official SDKs with full TypeScript support, comprehensive
						documentation, and examples for every use case.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 text-center">
							<div className="mb-4 text-6xl">⚡</div>
							<h3 className="mb-2 font-semibold text-xl">Node.js</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Official Node.js SDK with full TypeScript support and
								async/await
							</p>
							<code className="mb-4 block rounded bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
								npm install @reloop/sdk
							</code>
							<Link
								href="/docs/sdk/nodejs"
								className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								View Documentation →
							</Link>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 text-center">
							<div className="mb-4 text-6xl">🐍</div>
							<h3 className="mb-2 font-semibold text-xl">Python</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Python SDK with async support and comprehensive type hints
							</p>
							<code className="mb-4 block rounded bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
								pip install reloop
							</code>
							<Link
								href="/docs/sdk/python"
								className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								View Documentation →
							</Link>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 text-center">
							<div className="mb-4 text-6xl">☕</div>
							<h3 className="mb-2 font-semibold text-xl">Java</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Java SDK with Spring Boot integration and comprehensive
								annotations
							</p>
							<code className="mb-4 block rounded bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
								implementation 'com.reloop:sdk'
							</code>
							<Link
								href="/docs/sdk/java"
								className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								View Documentation →
							</Link>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 text-center">
							<div className="mb-4 text-6xl">🦀</div>
							<h3 className="mb-2 font-semibold text-xl">Rust</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								High-performance Rust SDK with tokio async runtime
							</p>
							<code className="mb-4 block rounded bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
								reloop = "1.0"
							</code>
							<Link
								href="/docs/sdk/rust"
								className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								View Documentation →
							</Link>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 text-center">
							<div className="mb-4 text-6xl">🐹</div>
							<h3 className="mb-2 font-semibold text-xl">Go</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								Go SDK with goroutine support and context handling
							</p>
							<code className="mb-4 block rounded bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
								go get github.com/reloop/sdk-go
							</code>
							<Link
								href="/docs/sdk/go"
								className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								View Documentation →
							</Link>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 text-center">
							<div className="mb-4 text-6xl">🐘</div>
							<h3 className="mb-2 font-semibold text-xl">PHP</h3>
							<p className="mb-4 text-sm text-text-sub-600">
								PHP SDK with Composer support and PSR standards
							</p>
							<code className="mb-4 block rounded bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800">
								composer require reloop/sdk
							</code>
							<Link
								href="/docs/sdk/php"
								className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								View Documentation →
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">SDK Features</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							All our SDKs come with comprehensive features to make email
							integration simple and reliable.
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
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Type Safety</h3>
							<p className="text-text-sub-600 leading-6">
								Full TypeScript support with comprehensive type definitions and
								IntelliSense for better developer experience.
							</p>
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
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Automatic Retries</h3>
							<p className="text-text-sub-600 leading-6">
								Built-in retry logic with exponential backoff for failed
								requests. Configurable retry policies for different scenarios.
							</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
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
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Error Handling</h3>
							<p className="text-text-sub-600 leading-6">
								Comprehensive error handling with detailed error messages and
								proper exception types for easy debugging.
							</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8">
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
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Documentation</h3>
							<p className="text-text-sub-600 leading-6">
								Comprehensive documentation with examples, API reference, and
								best practices for each programming language.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Ready to Get Started?</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Choose your preferred programming language and start integrating
					Reloop into your applications today. Get your API key and begin
					sending emails in minutes.
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
						View Documentation
					</Link>
				</div>
			</section>
		</div>
	);
};

export default SDKsPage;
