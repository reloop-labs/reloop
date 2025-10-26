import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Transaction Emails | Reloop",
	description:
		"Reliable transactional email delivery for critical communications. Send receipts, notifications, password resets, and more with 99.9% uptime and instant delivery.",
	openGraph: {
		title: "Transaction Emails | Reloop",
		description:
			"Reliable transactional email delivery for critical communications. Send receipts, notifications, password resets, and more with 99.9% uptime and instant delivery.",
		type: "website",
	},
};

const TransactionEmailsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Transaction Emails
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Deliver critical emails with confidence. Send receipts, notifications,
					password resets, and more with enterprise-grade reliability and
					instant delivery.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
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
						View Demo
					</Link>
				</div>
			</section>

			{/* Key Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Built for Critical Communications
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						When every email matters, trust Reloop for reliable transactional
						email delivery with enterprise-grade infrastructure.
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
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">99.9% Uptime SLA</h3>
						<p className="text-text-sub-600 leading-6">
							Enterprise-grade reliability with automatic failover and redundant
							infrastructure to ensure your emails always get delivered.
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
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Instant Delivery</h3>
						<p className="text-text-sub-600 leading-6">
							Send transactional emails in real-time with sub-second delivery
							times. Perfect for time-sensitive notifications and receipts.
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
						<h3 className="mb-3 font-semibold text-xl">Advanced Security</h3>
						<p className="text-text-sub-600 leading-6">
							End-to-end encryption, SPF/DKIM authentication, and compliance
							with GDPR, HIPAA, and SOC 2 standards for secure email delivery.
						</p>
					</div>
				</div>
			</section>

			{/* Use Cases */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Perfect for Every Transaction
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							From e-commerce receipts to security notifications, Reloop handles
							all your critical email communications with reliability and speed.
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
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
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">
								E-commerce Receipts
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Send order confirmations, shipping notifications, and invoice
								receipts with professional templates and instant delivery.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• Order confirmations</li>
								<li>• Shipping notifications</li>
								<li>• Invoice receipts</li>
								<li>• Return confirmations</li>
							</ul>
						</div>

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
										d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">
								Security Notifications
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Keep users informed about account security with password resets,
								login alerts, and two-factor authentication codes.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• Password reset links</li>
								<li>• Login alerts</li>
								<li>• 2FA codes</li>
								<li>• Security warnings</li>
							</ul>
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
										d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">
								System Notifications
							</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Send automated system alerts, maintenance notifications, and
								status updates to keep users informed.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• System alerts</li>
								<li>• Maintenance notices</li>
								<li>• Status updates</li>
								<li>• Feature announcements</li>
							</ul>
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
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Real-time Alerts</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								Deliver time-sensitive alerts and notifications instantly with
								our high-performance infrastructure.
							</p>
							<ul className="space-y-2 text-sm text-text-sub-600">
								<li>• Payment confirmations</li>
								<li>• Booking confirmations</li>
								<li>• Appointment reminders</li>
								<li>• Emergency alerts</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Send Critical Emails?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Trust Reloop for your most important email communications. Get
					enterprise-grade reliability with simple setup and transparent
					pricing.
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
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Transaction Demo
					</Link>
				</div>
			</section>
		</div>
	);
};

export default TransactionEmailsPage;
