import * as Button from "@reloop/ui/button";
import Link from "next/link";

const OurProductBeliefsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Our Product Beliefs
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Every product decision we make is guided by fundamental beliefs about
					how software should work. These principles shape our roadmap, our
					features, and our user experience.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/features"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Explore Features
					</Link>
					<Link
						href="/roadmap"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Roadmap
					</Link>
				</div>
			</section>

			{/* Core Product Beliefs */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						How We Think About Product
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						These beliefs drive every feature we build and every decision we
						make. They're our north star for creating exceptional email
						infrastructure.
					</p>
				</div>

				<div className="space-y-16">
					{/* User-Centric Design */}
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
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<h3 className="mb-4 font-semibold text-2xl">
								Users Come First, Always
							</h3>
							<p className="mb-4 text-text-sub-600 leading-7">
								Every feature starts with a real user problem. We don't build
								technology for technology's sake—we build solutions that make
								developers' lives easier and more productive.
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
									User research drives our roadmap
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
									Every interface is tested with real users
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
									Continuous feedback loops shape iterations
								</li>
							</ul>
						</div>
						<div className="md:w-1/2">
							<div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
								<div className="text-4xl">👥</div>
							</div>
						</div>
					</div>

					{/* Simplicity */}
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
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h3 className="mb-4 font-semibold text-2xl">
								Complexity is the Enemy
							</h3>
							<p className="mb-4 text-text-sub-600 leading-7">
								The best products feel magical because they hide complexity, not
								because they add it. We obsess over making powerful capabilities
								feel effortless and intuitive.
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
									Smart defaults reduce configuration
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
									Progressive disclosure reveals complexity
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
									Clean interfaces promote understanding
								</li>
							</ul>
						</div>
						<div className="md:w-1/2">
							<div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-green-900/20 dark:to-emerald-900/20">
								<div className="text-4xl">✨</div>
							</div>
						</div>
					</div>

					{/* Developer Experience */}
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
										d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
									/>
								</svg>
							</div>
							<h3 className="mb-4 font-semibold text-2xl">
								Developer Experience is Everything
							</h3>
							<p className="mb-4 text-text-sub-600 leading-7">
								Great tools make developers feel powerful and confident. We
								craft APIs, documentation, and interfaces that developers
								actually want to use and recommend to others.
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
									Comprehensive, searchable documentation
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
									SDKs in every major language
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
									Interactive examples and tutorials
								</li>
							</ul>
						</div>
						<div className="md:w-1/2">
							<div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-8 dark:from-purple-900/20 dark:to-pink-900/20">
								<div className="text-4xl">⚡</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Product Principles Grid */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Our Product Principles
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						These principles guide every product decision, from major features
						to small interface details.
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
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">
							Innovation Through Iteration
						</h3>
						<p className="text-text-sub-600 leading-6">
							We ship early, learn fast, and improve constantly. The best
							products evolve through real user feedback, not perfect initial
							planning.
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
						<h3 className="mb-3 font-semibold text-xl">Reliability First</h3>
						<p className="text-text-sub-600 leading-6">
							Email infrastructure must work every time, without exception. We
							prioritize stability and consistency over flashy features that
							might introduce risk.
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
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Performance Matters</h3>
						<p className="text-text-sub-600 leading-6">
							Speed isn't just a feature—it's a fundamental requirement. Every
							millisecond matters when you're sending millions of emails or
							processing time-sensitive data.
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
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Accessibility Always</h3>
						<p className="text-text-sub-600 leading-6">
							Great products work for everyone. We design with accessibility in
							mind from day one, ensuring our tools are usable by developers of
							all abilities.
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
						<h3 className="mb-3 font-semibold text-xl">Global by Design</h3>
						<p className="text-text-sub-600 leading-6">
							Email is a global medium, and our product reflects that. We build
							for international users from the start, with proper localization
							and regional considerations.
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Security by Design</h3>
						<p className="text-text-sub-600 leading-6">
							Security isn't bolted on—it's baked in. Every feature is designed
							with security considerations from the ground up, protecting both
							our users and their data.
						</p>
					</div>
				</div>
			</section>

			{/* How We Build */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<h2 className="title-h2 mb-12 text-center font-semibold">
						How We Build Products
					</h2>

					<div className="space-y-8">
						<div className="flex gap-4">
							<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-sm text-white">
								1
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-lg">
									Listen to Real Problems
								</h3>
								<p className="text-text-sub-600 leading-7">
									We start by understanding genuine pain points from our
									community. Every feature begins with a real user struggling
									with a real problem.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-sm text-white">
								2
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-lg">
									Design for Simplicity
								</h3>
								<p className="text-text-sub-600 leading-7">
									We explore multiple solutions and choose the one that feels
									most natural. Complex problems often have elegant solutions if
									you dig deep enough.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-sm text-white">
								3
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-lg">
									Build, Test, Learn
								</h3>
								<p className="text-text-sub-600 leading-7">
									We ship early versions to gather feedback, then iterate
									rapidly based on real usage patterns and user feedback.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 font-bold text-sm text-white">
								4
							</div>
							<div>
								<h3 className="mb-2 font-semibold text-lg">
									Polish Relentlessly
								</h3>
								<p className="text-text-sub-600 leading-7">
									The difference between good and great is in the details. We
									obsess over the small things that make the overall experience
									exceptional.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Experience Our Product Philosophy
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					These beliefs aren't just theory—they're reflected in every feature we
					ship. Try Reloop and experience the difference thoughtful product
					design makes.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Try It Yourself
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
					<Link
						href="/features"
						className={Button.buttonVariants({
							mode: "ghost",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Explore Features
					</Link>
				</div>
			</section>
		</div>
	);
};

export default OurProductBeliefsPage;
