import * as Button from "@reloop/ui/button";
import Link from "next/link";

const DevelopersPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Developer-First Email Infrastructure
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Send transactionals and marketing broadcasts with our clean APIs, robust SDKs,
					and fully-managed SMTP relay servers. Built for maximum reliability, speed, and DX.
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
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Read API Docs
					</Link>
				</div>
			</section>

			{/* Core Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Supercharged Developer Experience
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Integrate in minutes using our modern tooling and event pipelines.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{/* Card 1 */}
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
									d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Type-Safe Client SDKs</h3>
						<p className="text-text-sub-600 leading-6">
							Official libraries for TypeScript/Node.js, Go, Python, Rust, and PHP. 
							Benefit from full autocompletion, inline docs, and validation.
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
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Real-Time MTA Logs</h3>
						<p className="text-text-sub-600 leading-6">
							Trace the exact path of your emails. Track SMTP handshakes, deliveries,
							bounces, and latencies down to the millisecond with our live logging console.
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
									d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Local Dev Sandbox</h3>
						<p className="text-text-sub-600 leading-6">
							Test emails locally with our open-source SMTP server, web interface,
							and sandbox APIs. Never send test emails to real users by accident again.
						</p>
					</div>
				</div>
			</section>

			{/* Dev Metrics */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">
						Engineered for Absolute Performance
					</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						Get the scale your app needs with reliable global delivery infrastructure.
					</p>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								&lt;12ms
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								API Response
							</div>
							<div className="text-sm text-text-sub-600">
								Under-the-hood Rust MTA dispatching
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								100%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Type Safety
							</div>
							<div className="text-sm text-text-sub-600">
								Zero runtime template errors
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								99.9%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Webhook SLA
							</div>
							<div className="text-sm text-text-sub-600">
								Reliable delivery event piping
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-orange-600 dark:text-orange-400">
								100M+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Emails / Day
							</div>
							<div className="text-sm text-text-sub-600">
								Proven capacity for massive workloads
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to upgrade your email stack?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Create a free developer account and send your first email in under 3 minutes.
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
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View SDK Libraries
					</Link>
				</div>
			</section>
		</div>
	);
};

export default DevelopersPage;
