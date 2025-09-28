import * as Button from "@reloop/ui/button";
import Link from "next/link";

const EngineeringPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Engineering Excellence
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Great products are built by great engineering. Our technical
					philosophy emphasizes reliability, performance, and maintainability at
					every level of our stack.
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
						View Our Code
					</a>
					<Link
						href="/careers"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Join Our Team
					</Link>
				</div>
			</section>

			{/* Engineering Principles */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Our Engineering Philosophy
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						These principles guide how we architect, build, and maintain
						software that millions of developers rely on every day.
					</p>
				</div>

				<div className="space-y-16">
					{/* Code Quality */}
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
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="mb-4 font-semibold text-2xl">
								Code Quality is Non-Negotiable
							</h3>
							<p className="mb-4 text-text-sub-600 leading-7">
								We write code as if the person maintaining it is a violent
								psychopath who knows where we live. Clean, readable, and
								well-tested code isn't optional—it's essential.
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
									90%+ test coverage across all services
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
									Mandatory code reviews for all changes
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
									Automated linting and formatting
								</li>
							</ul>
						</div>
						<div className="md:w-1/2">
							<div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
								<div className="text-4xl">🔍</div>
							</div>
						</div>
					</div>

					{/* Performance */}
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
								Performance is a Feature
							</h3>
							<p className="mb-4 text-text-sub-600 leading-7">
								Every millisecond matters when you're processing millions of
								emails. We optimize relentlessly and measure everything to
								ensure peak performance at scale.
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
									Sub-100ms API response times
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
									Horizontal scaling by design
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
									Continuous performance monitoring
								</li>
							</ul>
						</div>
						<div className="md:w-1/2">
							<div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-green-900/20 dark:to-emerald-900/20">
								<div className="text-4xl">⚡</div>
							</div>
						</div>
					</div>

					{/* Reliability */}
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
								Built for 99.9% Uptime
							</h3>
							<p className="mb-4 text-text-sub-600 leading-7">
								Email infrastructure can't go down. We architect for resilience
								with redundancy, graceful degradation, and automatic failover at
								every layer.
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
									Multi-region deployment
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
									Automatic failover mechanisms
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
									24/7 monitoring and alerting
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
			</section>

			{/* Tech Stack */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">Our Technology Stack</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						We choose technologies based on their ability to scale, their
						community support, and their alignment with our engineering values.
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
						<h3 className="mb-3 font-semibold text-xl">Modern Languages</h3>
						<p className="text-text-sub-600 leading-6">
							TypeScript for type safety, Go for performance-critical services,
							and Rust for systems-level components where every microsecond
							counts.
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
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">
							Battle-Tested Databases
						</h3>
						<p className="text-text-sub-600 leading-6">
							PostgreSQL for relational data, Redis for caching, and ClickHouse
							for analytics. Each database chosen for its specific strengths.
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
									d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">
							Cloud-Native Architecture
						</h3>
						<p className="text-text-sub-600 leading-6">
							Kubernetes for orchestration, Docker for containerization, and
							Terraform for infrastructure as code. Built to scale globally.
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
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Observability First</h3>
						<p className="text-text-sub-600 leading-6">
							Prometheus for metrics, Grafana for visualization, and distributed
							tracing to understand system behavior at every level.
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Security by Default</h3>
						<p className="text-text-sub-600 leading-6">
							Zero-trust networking, encrypted everything, and automated
							security scanning in our CI/CD pipeline. Security isn't optional.
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
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Developer Experience</h3>
						<p className="text-text-sub-600 leading-6">
							Modern tooling, automated testing, and fast feedback loops. We
							optimize for developer productivity and happiness.
						</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Join Our Engineering Team
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					We're always looking for talented engineers who share our passion for
					building exceptional software. Come help us shape the future of email
					infrastructure.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/careers"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Open Positions
					</Link>
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						Explore Our Code
					</a>
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

export default EngineeringPage;
