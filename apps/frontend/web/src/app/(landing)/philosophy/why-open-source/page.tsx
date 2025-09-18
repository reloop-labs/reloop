import * as Button from "@reloop/ui/button";
import Link from "next/link";

const WhyOpenSourcePage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Why We Choose Open Source
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Transparency, security, and community-driven innovation are at the
					heart of everything we build. Here's why Reloop is proudly open
					source.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						View on GitHub
					</a>
					<Link
						href="/resources/self-hosting-guide"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Self-Hosting Guide
					</Link>
				</div>
			</section>

			{/* Benefits Grid */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						The Open Source Advantage
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Open source isn't just a development model—it's a philosophy that
						drives better software and stronger communities.
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
						<h3 className="mb-3 font-semibold text-xl">
							Complete Transparency
						</h3>
						<p className="text-text-sub-600 leading-6">
							Every line of code is visible. You know exactly how your email
							infrastructure works, with no hidden algorithms or black boxes.
						</p>
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
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Enhanced Security</h3>
						<p className="text-text-sub-600 leading-6">
							Open source means thousands of eyes reviewing our code. Security
							vulnerabilities are found and fixed faster than in proprietary
							software.
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
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Community Innovation</h3>
						<p className="text-text-sub-600 leading-6">
							Our community contributes features, fixes, and improvements that
							benefit everyone. Innovation happens faster when we work together.
						</p>
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">No Vendor Lock-in</h3>
						<p className="text-text-sub-600 leading-6">
							You own your infrastructure. Self-host on your servers, modify the
							code, or migrate whenever you want. Your data stays yours.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
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
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Rapid Development</h3>
						<p className="text-text-sub-600 leading-6">
							Open development means faster iteration cycles, quicker bug fixes,
							and features that actually solve real-world problems.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/20">
							<svg
								className="h-6 w-6 text-teal-600 dark:text-teal-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Global Accessibility</h3>
						<p className="text-text-sub-600 leading-6">
							Open source removes barriers. Anyone, anywhere can use, modify,
							and contribute to Reloop, fostering global innovation.
						</p>
					</div>
				</div>
			</section>

			{/* Community Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">
						Built by the Community, For the Community
					</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						Reloop thrives because of our vibrant community of developers,
						engineers, and email experts who contribute their knowledge and
						expertise to make email infrastructure better for everyone.
					</p>

					<div className="grid gap-8 md:grid-cols-3">
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								1000+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								GitHub Stars
							</div>
							<div className="text-sm text-text-sub-600">
								And growing every day
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								50+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Contributors
							</div>
							<div className="text-sm text-text-sub-600">
								From around the world
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								24/7
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Community Support
							</div>
							<div className="text-sm text-text-sub-600">
								Always here to help
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<h2 className="title-h2 mb-12 text-center font-semibold">
						Our Open Source Values
					</h2>

					<div className="space-y-12">
						<div className="flex flex-col gap-8 md:flex-row md:items-center">
							<div className="md:w-1/2">
								<h3 className="mb-4 font-semibold text-2xl">
									Collaboration Over Competition
								</h3>
								<p className="text-text-sub-600 leading-7">
									We believe the best solutions emerge when brilliant minds work
									together. Instead of competing in isolation, we collaborate
									openly to push the boundaries of what's possible in email
									infrastructure.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
									<div className="text-4xl">🤝</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-8 md:flex-row-reverse md:items-center">
							<div className="md:w-1/2">
								<h3 className="mb-4 font-semibold text-2xl">
									Quality Through Transparency
								</h3>
								<p className="text-text-sub-600 leading-7">
									When code is open, quality improves naturally. Every commit is
									reviewed, every decision is documented, and every bug is
									tracked publicly. This transparency leads to more robust and
									reliable software.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-green-900/20 dark:to-emerald-900/20">
									<div className="text-4xl">🔍</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-8 md:flex-row md:items-center">
							<div className="md:w-1/2">
								<h3 className="mb-4 font-semibold text-2xl">
									Innovation for Everyone
								</h3>
								<p className="text-text-sub-600 leading-7">
									Great ideas shouldn't be locked behind paywalls or NDAs. By
									keeping Reloop open source, we ensure that innovations in
									email infrastructure benefit everyone, from individual
									developers to large enterprises.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-8 dark:from-purple-900/20 dark:to-pink-900/20">
									<div className="text-4xl">💡</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Join the Movement</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Ready to be part of something bigger? Contribute to Reloop, deploy
					your own instance, or simply star us on GitHub to show your support
					for open source email infrastructure.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						⭐ Star on GitHub
					</a>
					<Link
						href="/resources/self-hosting-guide"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Self-Hosting
					</Link>
					<Link
						href="/contact"
						className={Button.buttonVariants({
							mode: "ghost",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get in Touch
					</Link>
				</div>
			</section>
		</div>
	);
};

export default WhyOpenSourcePage;
