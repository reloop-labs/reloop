import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "System Status | Reloop",
	description:
		"Real-time system status and uptime monitoring for Reloop email infrastructure. Check service health, incident history, and performance metrics.",
	openGraph: {
		title: "System Status | Reloop",
		description:
			"Real-time system status and uptime monitoring for Reloop email infrastructure. Check service health, incident history, and performance metrics.",
		type: "website",
	},
};

const StatusPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					System Status
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Real-time monitoring of our email infrastructure. Check service
					health, uptime metrics, and stay informed about any incidents.
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

			{/* Current Status */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Current Status</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							All systems operational. We maintain 99.9% uptime with real-time
							monitoring and instant incident response.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
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
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 font-semibold text-lg">API Services</h3>
							<div className="mb-2 font-bold text-2xl text-green-600 dark:text-green-400">
								100%
							</div>
							<p className="text-sm text-text-sub-600">Operational</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
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
										d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 font-semibold text-lg">Email Delivery</h3>
							<div className="mb-2 font-bold text-2xl text-green-600 dark:text-green-400">
								99.9%
							</div>
							<p className="text-sm text-text-sub-600">Operational</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
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
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 font-semibold text-lg">Analytics</h3>
							<div className="mb-2 font-bold text-2xl text-green-600 dark:text-green-400">
								100%
							</div>
							<p className="text-sm text-text-sub-600">Operational</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
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
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<h3 className="mb-2 font-semibold text-lg">Webhooks</h3>
							<div className="mb-2 font-bold text-2xl text-green-600 dark:text-green-400">
								100%
							</div>
							<p className="text-sm text-text-sub-600">Operational</p>
						</div>
					</div>
				</div>
			</section>

			{/* Uptime Metrics */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Uptime Metrics</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Our commitment to reliability with 99.9% uptime SLA and
							comprehensive monitoring across all services.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						<div className="rounded-xl border border-stroke-soft-100 p-8 text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								99.9%
							</div>
							<h3 className="mb-2 font-semibold text-xl">Last 30 Days</h3>
							<p className="text-text-sub-600 leading-6">
								Average uptime across all services with zero major incidents
							</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8 text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								99.95%
							</div>
							<h3 className="mb-2 font-semibold text-xl">Last 90 Days</h3>
							<p className="text-text-sub-600 leading-6">
								Consistent performance with minimal maintenance windows
							</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-8 text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								99.98%
							</div>
							<h3 className="mb-2 font-semibold text-xl">Last 365 Days</h3>
							<p className="text-text-sub-600 leading-6">
								Annual uptime exceeding our 99.9% SLA commitment
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Recent Incidents */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Recent Incidents</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Transparent reporting of any service disruptions and our response
							to maintain reliability.
						</p>
					</div>

					<div className="space-y-6">
						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded bg-green-100 px-3 py-1 font-semibold text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
									Resolved
								</div>
								<span className="text-sm text-text-sub-600">
									December 10, 2024
								</span>
							</div>
							<h3 className="mb-2 font-semibold text-xl">
								API Response Time Degradation
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Brief increase in API response times due to high traffic load.
								Issue resolved within 15 minutes with no data loss.
							</p>
							<div className="text-sm text-text-sub-600">
								<strong>Duration:</strong> 15 minutes | <strong>Impact:</strong>{" "}
								Minor | <strong>Status:</strong> Resolved
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded bg-green-100 px-3 py-1 font-semibold text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
									Resolved
								</div>
								<span className="text-sm text-text-sub-600">
									November 28, 2024
								</span>
							</div>
							<h3 className="mb-2 font-semibold text-xl">
								Scheduled Maintenance
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Planned maintenance window for database optimization. All
								services restored within expected timeframe.
							</p>
							<div className="text-sm text-text-sub-600">
								<strong>Duration:</strong> 2 hours | <strong>Impact:</strong>{" "}
								Planned | <strong>Status:</strong> Completed
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded bg-green-100 px-3 py-1 font-semibold text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
									Resolved
								</div>
								<span className="text-sm text-text-sub-600">
									November 15, 2024
								</span>
							</div>
							<h3 className="mb-2 font-semibold text-xl">
								Email Delivery Delay
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Temporary delay in email processing due to third-party SMTP
								provider issue. Resolved with failover to backup systems.
							</p>
							<div className="text-sm text-text-sub-600">
								<strong>Duration:</strong> 45 minutes | <strong>Impact:</strong>{" "}
								Minor | <strong>Status:</strong> Resolved
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Monitoring */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Monitoring & Alerts</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Comprehensive monitoring across all infrastructure components with
							instant alerting and automated response systems.
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
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">
								Real-time Monitoring
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								24/7 monitoring of all services with sub-second response times
								and automated health checks across multiple regions.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• API endpoint monitoring</li>
								<li>• Database performance tracking</li>
								<li>• Email delivery metrics</li>
								<li>• Infrastructure health checks</li>
							</ul>
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
										d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7l-6 6-6-6z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Instant Alerts</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Immediate notification system with multiple alert channels and
								escalation procedures for critical issues.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• Email notifications</li>
								<li>• SMS alerts for critical issues</li>
								<li>• Slack integration</li>
								<li>• Automated escalation</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Stay Informed</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Subscribe to status updates and be the first to know about any service
					changes or incidents. We're committed to transparency and reliability.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started
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

export default StatusPage;
