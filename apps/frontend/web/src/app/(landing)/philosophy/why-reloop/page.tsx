import * as Button from "@reloop/ui/button";
import Link from "next/link";

const WhyReloopPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Why Reloop Exists
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Email infrastructure shouldn't be complicated, expensive, or
					unreliable. We're building the future of email delivery—one that's
					simple, powerful, and accessible to everyone.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started Today
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						See It in Action
					</Link>
				</div>
			</section>

			{/* Problem Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">
						The Email Infrastructure Problem
					</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						Today's email solutions force you to choose between complexity,
						cost, and reliability. We believe you shouldn't have to compromise.
					</p>

					<div className="grid gap-8 md:grid-cols-3">
						<div className="rounded-xl border border-red-100 bg-red-50/50 p-8 dark:border-red-900/30 dark:bg-red-900/10">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
								<svg
									className="h-6 w-6 text-red-600 dark:text-red-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-red-900 text-xl dark:text-red-100">
								Expensive & Unpredictable
							</h3>
							<p className="text-red-700 leading-6 dark:text-red-300">
								Legacy providers charge premium prices with complex pricing
								tiers. Costs spiral as you scale, with hidden fees and usage
								caps.
							</p>
						</div>

						<div className="rounded-xl border border-orange-100 bg-orange-50/50 p-8 dark:border-orange-900/30 dark:bg-orange-900/10">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
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
										d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-orange-900 text-xl dark:text-orange-100">
								Complex & Overwhelming
							</h3>
							<p className="text-orange-700 leading-6 dark:text-orange-300">
								Setting up email infrastructure requires deep expertise in SMTP,
								DNS, deliverability, and compliance. Most teams get lost in the
								details.
							</p>
						</div>

						<div className="rounded-xl border border-yellow-100 bg-yellow-50/50 p-8 dark:border-yellow-900/30 dark:bg-yellow-900/10">
							<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
								<svg
									className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl text-yellow-900 dark:text-yellow-100">
								Unreliable & Opaque
							</h3>
							<p className="text-yellow-700 leading-6 dark:text-yellow-300">
								Black-box systems with poor visibility. When emails fail, you're
								left guessing why. Vendor lock-in makes switching providers
								painful.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Solution Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-6 font-semibold">
							Our Solution: Email Infrastructure, Reimagined
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-8">
							Reloop combines the best of modern technology with time-tested
							email protocols to deliver a platform that's powerful yet simple,
							affordable yet reliable.
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
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									Simple by Design
								</h3>
								<p className="text-text-sub-600 leading-7">
									Deploy in minutes with our one-click setup. Our intuitive
									dashboard gives you everything you need without the
									complexity. Focus on your product, not email infrastructure.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
									<div className="text-4xl">⚡</div>
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
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									Transparent Pricing
								</h3>
								<p className="text-text-sub-600 leading-7">
									Pay only for what you use with our straightforward pricing
									model. No hidden fees, no surprise charges, no complex tiers.
									Scale confidently knowing exactly what you'll pay.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-green-900/20 dark:to-emerald-900/20">
									<div className="text-4xl">💰</div>
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
											d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									Built for Reliability
								</h3>
								<p className="text-text-sub-600 leading-7">
									Enterprise-grade infrastructure with 99.9% uptime SLA.
									Real-time monitoring, automatic failover, and detailed
									analytics give you complete visibility and control.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-8 dark:from-purple-900/20 dark:to-pink-900/20">
									<div className="text-4xl">🛡️</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Vision Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">Our Vision for Email</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						We envision a world where email infrastructure is as easy to use as
						sending a text message, as reliable as the internet itself, and as
						accessible as open source software.
					</p>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								99.9%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Uptime SLA
							</div>
							<div className="text-sm text-text-sub-600">
								Always available when you need it
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								&lt;5min
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Setup Time
							</div>
							<div className="text-sm text-text-sub-600">
								From signup to sending emails
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								50%
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Cost Savings
							</div>
							<div className="text-sm text-text-sub-600">
								Compared to legacy providers
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-orange-600 dark:text-orange-400">
								24/7
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Support
							</div>
							<div className="text-sm text-text-sub-600">
								Expert help when you need it
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Experience the Difference?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Join thousands of developers who've already made the switch to
					simpler, more reliable email infrastructure. Start your free trial
					today.
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
						href="/pricing"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Pricing
					</Link>
					<Link
						href="/contact"
						className={Button.buttonVariants({
							mode: "ghost",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Talk to Sales
					</Link>
				</div>
			</section>
		</div>
	);
};

export default WhyReloopPage;
