import * as Button from "@reloop/ui/button";
import Link from "next/link";

const DeliverabilityPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Email Deliverability
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Ensure your emails reach the inbox, not the spam folder. Our
					deliverability tools and expertise help you maintain excellent sender
					reputation and maximize email performance.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Improve Deliverability
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						See Demo
					</Link>
				</div>
			</section>

			{/* Deliverability Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Built-in Deliverability Tools
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Every feature is designed to help your emails reach the inbox and
						maintain a strong sender reputation.
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
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Spam Testing</h3>
						<p className="text-text-sub-600 leading-6">
							Test your emails against major spam filters before sending. Get
							detailed reports and suggestions to improve deliverability.
						</p>
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
							Reputation Monitoring
						</h3>
						<p className="text-text-sub-600 leading-6">
							Track your sender reputation across major email providers. Get
							alerts when your reputation drops and guidance to improve it.
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Authentication Setup</h3>
						<p className="text-text-sub-600 leading-6">
							Automatic SPF, DKIM, and DMARC setup with guided configuration.
							Prove your emails are legitimate and improve deliverability.
						</p>
					</div>
				</div>
			</section>

			{/* Performance Stats */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">
						Industry-Leading Deliverability
					</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						Our customers consistently achieve better deliverability rates
						compared to industry averages.
					</p>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								99.5%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Delivery Rate
							</div>
							<div className="text-sm text-text-sub-600">
								Average across all customers
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								95%+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Inbox Placement
							</div>
							<div className="text-sm text-text-sub-600">
								Reach the primary inbox
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								&lt;0.1%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Spam Rate
							</div>
							<div className="text-sm text-text-sub-600">
								Industry-low spam complaints
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-orange-600 dark:text-orange-400">
								24/7
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Monitoring
							</div>
							<div className="text-sm text-text-sub-600">
								Continuous deliverability tracking
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Improve Your Deliverability?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Start reaching more inboxes today. Our deliverability experts are here
					to help you optimize your email performance.
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
						href="/contact"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Talk to Expert
					</Link>
				</div>
			</section>
		</div>
	);
};

export default DeliverabilityPage;
