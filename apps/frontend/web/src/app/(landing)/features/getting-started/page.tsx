import * as Button from "@reloop/ui/button";
import Link from "next/link";

const GettingStartedPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Getting Started with Reloop
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Get your email infrastructure up and running in minutes. From signup
					to sending your first email, we'll guide you through every step.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/signup"
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
						Watch Demo
					</Link>
				</div>
			</section>

			{/* Quick Start Steps */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Quick Start Guide</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Follow these simple steps to start sending emails with Reloop in
							under 5 minutes.
						</p>
					</div>

					<div className="space-y-8">
						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
								1
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">
									Create Your Account
								</h3>
								<p className="mb-4 text-text-sub-600 leading-7">
									Sign up for a free Reloop account. No credit card required to
									get started with our generous free tier.
								</p>
								<Link
									href="/signup"
									className={Button.buttonVariants({
										mode: "stroke",
										variant: "neutral",
									}).root({ className: "h-10 px-6" })}
								>
									Sign Up Free
								</Link>
							</div>
						</div>

						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white">
								2
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">
									Verify Your Domain
								</h3>
								<p className="mb-4 text-text-sub-600 leading-7">
									Add your domain and verify ownership by adding a simple DNS
									record. Our step-by-step guide makes this painless.
								</p>
								<div className="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
									<div className="text-gray-600 dark:text-gray-400">
										# Add this TXT record to your DNS:
									</div>
									<div>reloop-verify=abc123def456</div>
								</div>
							</div>
						</div>

						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
								3
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">Get Your API Key</h3>
								<p className="mb-4 text-text-sub-600 leading-7">
									Generate your API key from the dashboard. Keep it
									secure—you'll use this to authenticate your API requests.
								</p>
								<div className="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
									<div className="text-gray-600 dark:text-gray-400">
										# Your API key will look like this:
									</div>
									<div>rl_live_1234567890abcdef...</div>
								</div>
							</div>
						</div>

						<div className="flex gap-6">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-white">
								4
							</div>
							<div className="flex-1">
								<h3 className="mb-3 font-semibold text-xl">
									Send Your First Email
								</h3>
								<p className="mb-4 text-text-sub-600 leading-7">
									Use our API, SDK, or dashboard to send your first email.
									Here's a simple example using our REST API:
								</p>
								<div className="rounded-lg bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
									<div className="text-gray-600 dark:text-gray-400">
										# Send email via REST API
									</div>
									<div className="mt-2">
										curl -X POST https://api.reloop.com/v1/emails \<br />
										&nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
										&nbsp;&nbsp;-H "Content-Type: application/json" \<br />
										&nbsp;&nbsp;-d '{"{"}
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;"from": "hello@yourdomain.com",
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;"to": "user@example.com",
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;"subject": "Welcome to our app!",
										<br />
										&nbsp;&nbsp;&nbsp;&nbsp;"html": "&lt;h1&gt;Hello
										World!&lt;/h1&gt;"
										<br />
										&nbsp;&nbsp;{"}"}'
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Ready to Get Started?</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Join thousands of developers who trust Reloop for their email
					infrastructure. Start your free trial today—no credit card required.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/signup"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Free Trial
					</Link>
					<Link
						href="/docs"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Read the Docs
					</Link>
				</div>
			</section>
		</div>
	);
};

export default GettingStartedPage;
