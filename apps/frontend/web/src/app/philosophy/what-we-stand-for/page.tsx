import * as Button from "@reloop/ui/button";
import Link from "next/link";

const WhatWeStandForPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					What We Stand For
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Our core values guide every decision we make, every feature we build,
					and every relationship we foster. These principles define who we are
					and what we believe in.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/about"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Learn About Our Team
					</Link>
					<Link
						href="/careers"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Join Our Mission
					</Link>
				</div>
			</section>

			{/* Core Values */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">Our Core Values</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						These values aren't just words on a wall—they're the foundation of
						how we operate, innovate, and serve our community every day.
					</p>
				</div>

				<div className="grid gap-12 lg:grid-cols-2">
					<div className="space-y-6">
						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
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
							<div>
								<h3 className="mb-2 font-semibold text-xl">
									Radical Transparency
								</h3>
								<p className="text-text-sub-600 leading-7">
									We believe in complete openness in everything we do. From our
									open-source codebase to our public roadmap, we operate with
									transparency as our default state. No hidden agendas, no black
									boxes—just honest, clear communication.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
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
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">Community First</h3>
								<p className="text-text-sub-600 leading-7">
									Our community isn't just our users—they're our partners in
									building the future of email infrastructure. We listen, we
									learn, and we build together. Every feature request matters,
									every bug report is valuable.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
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
										d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">
									Relentless Innovation
								</h3>
								<p className="text-text-sub-600 leading-7">
									We're not satisfied with "good enough." We constantly push the
									boundaries of what's possible in email infrastructure, always
									looking for ways to make things simpler, faster, and more
									reliable.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
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
							<div>
								<h3 className="mb-2 font-semibold text-xl">
									Security by Design
								</h3>
								<p className="text-text-sub-600 leading-7">
									Security isn't an afterthought—it's built into every line of
									code, every architectural decision, and every feature we ship.
									We take the responsibility of handling your email
									infrastructure seriously.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/20">
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
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">
									Simplicity Over Complexity
								</h3>
								<p className="text-text-sub-600 leading-7">
									We believe the best solutions are elegant in their simplicity.
									Complex problems don't always need complex solutions. We
									strive to make powerful tools that are intuitive and easy to
									use.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-4">
							<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
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
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-xl">
									Empathy in Everything
								</h3>
								<p className="text-text-sub-600 leading-7">
									We put ourselves in our users' shoes with every decision.
									Whether it's designing an interface, writing documentation, or
									providing support, we approach everything with genuine care
									and understanding.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Principles in Action */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<h2 className="title-h2 mb-12 text-center font-semibold">
						Our Principles in Action
					</h2>

					<div className="space-y-12">
						<div className="flex flex-col gap-8 md:flex-row md:items-center">
							<div className="md:w-1/2">
								<h3 className="mb-4 font-semibold text-2xl">
									Open Source by Default
								</h3>
								<p className="mb-4 text-text-sub-600 leading-7">
									We don't just talk about transparency—we live it. Our entire
									codebase is open source, our development process is public,
									and our roadmap is community-driven.
								</p>
								<ul className="space-y-2 text-text-sub-600">
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Public GitHub repositories
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Community-driven feature requests
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Transparent development process
									</li>
								</ul>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
									<div className="text-4xl">🔓</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-8 md:flex-row-reverse md:items-center">
							<div className="md:w-1/2">
								<h3 className="mb-4 font-semibold text-2xl">
									Community-Centric Development
								</h3>
								<p className="mb-4 text-text-sub-600 leading-7">
									Our community shapes our product. We actively listen to
									feedback, prioritize community requests, and ensure our
									development serves real-world needs.
								</p>
								<ul className="space-y-2 text-text-sub-600">
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Monthly community calls
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Public feature voting
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										24/7 community support
									</li>
								</ul>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-green-900/20 dark:to-emerald-900/20">
									<div className="text-4xl">🤝</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-8 md:flex-row md:items-center">
							<div className="md:w-1/2">
								<h3 className="mb-4 font-semibold text-2xl">
									Security Without Compromise
								</h3>
								<p className="mb-4 text-text-sub-600 leading-7">
									We implement security at every layer, from code to
									infrastructure. Our commitment to security doesn't slow us
									down—it makes us stronger.
								</p>
								<ul className="space-y-2 text-text-sub-600">
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										End-to-end encryption
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Regular security audits
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Zero-trust architecture
									</li>
								</ul>
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

			{/* Our Commitment */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">Our Commitment to You</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						These aren't just ideals—they're promises we make to our community,
						our users, and ourselves. Here's what you can expect from us.
					</p>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
							<div className="mb-4 text-3xl">⚡</div>
							<h3 className="mb-2 font-semibold">Always Improving</h3>
							<p className="text-sm text-text-sub-600">
								We ship updates regularly and listen to your feedback to make
								Reloop better every day.
							</p>
						</div>
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
							<div className="mb-4 text-3xl">🔍</div>
							<h3 className="mb-2 font-semibold">Complete Transparency</h3>
							<p className="text-sm text-text-sub-600">
								No hidden costs, no secret algorithms. You'll always know
								exactly what's happening with your email infrastructure.
							</p>
						</div>
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
							<div className="mb-4 text-3xl">🤝</div>
							<h3 className="mb-2 font-semibold">Community Partnership</h3>
							<p className="text-sm text-text-sub-600">
								Your voice matters. We build features based on real needs and
								community feedback.
							</p>
						</div>
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
							<div className="mb-4 text-3xl">🛡️</div>
							<h3 className="mb-2 font-semibold">Uncompromising Security</h3>
							<p className="text-sm text-text-sub-600">
								Your data is sacred. We implement the highest security standards
								to keep your email infrastructure safe.
							</p>
						</div>
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
							<div className="mb-4 text-3xl">💡</div>
							<h3 className="mb-2 font-semibold">Relentless Innovation</h3>
							<p className="text-sm text-text-sub-600">
								We never stop pushing boundaries to make email infrastructure
								simpler, faster, and more reliable.
							</p>
						</div>
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm">
							<div className="mb-4 text-3xl">❤️</div>
							<h3 className="mb-2 font-semibold">Genuine Care</h3>
							<p className="text-sm text-text-sub-600">
								We approach every interaction with empathy and a genuine desire
								to help you succeed.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Join Us in Building the Future
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					These values guide everything we do. If they resonate with you, we'd
					love to have you as part of our community—whether as a user,
					contributor, or team member.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Your Journey
					</Link>
					<Link
						href="/careers"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Join Our Team
					</Link>
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							mode: "ghost",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						Contribute on GitHub
					</a>
				</div>
			</section>
		</div>
	);
};

export default WhatWeStandForPage;
