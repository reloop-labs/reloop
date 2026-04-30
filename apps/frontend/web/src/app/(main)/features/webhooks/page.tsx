import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Webhooks | Reloop",
	description:
		"Real-time webhook notifications for email events, delivery status, and user interactions. Configure webhooks to receive instant updates about your email campaigns.",
	openGraph: {
		title: "Webhooks | Reloop",
		description:
			"Real-time webhook notifications for email events, delivery status, and user interactions. Configure webhooks to receive instant updates about your email campaigns.",
		type: "website",
	},
};

const WebhooksPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Webhooks
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Receive real-time notifications about email events, delivery status,
					and user interactions. Keep your applications synchronized with
					instant webhook updates.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Set Up Webhooks
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View Examples
					</Link>
				</div>
			</section>

			{/* Webhook Events */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Available Webhook Events
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Subscribe to specific events to receive notifications about email
						delivery, user interactions, and system events.
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
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Email Delivered</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Triggered when an email is successfully delivered to the
							recipient's inbox.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">Event:</div>
							<div>email.delivered</div>
						</div>
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
						<h3 className="mb-3 font-semibold text-xl">Email Opened</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Triggered when a recipient opens an email. Includes device and
							location information.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">Event:</div>
							<div>email.opened</div>
						</div>
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
									d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Link Clicked</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Triggered when a recipient clicks a link in an email. Includes
							click tracking data.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">Event:</div>
							<div>email.link_clicked</div>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8">
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
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Email Bounced</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Triggered when an email bounces. Includes bounce reason and
							classification.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">Event:</div>
							<div>email.bounced</div>
						</div>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/20">
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
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Email Spam</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Triggered when a recipient marks an email as spam. Helps maintain
							sender reputation.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">Event:</div>
							<div>email.spam</div>
						</div>
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
						<h3 className="mb-3 font-semibold text-xl">Email Unsubscribed</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Triggered when a recipient unsubscribes from your emails.
							Automatically removes them from future campaigns.
						</p>
						<div className="rounded bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900">
							<div className="text-gray-600 dark:text-gray-400">Event:</div>
							<div>email.unsubscribed</div>
						</div>
					</div>
				</div>
			</section>

			{/* Webhook Payload */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Webhook Payload Structure
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							All webhook payloads follow a consistent structure with event
							metadata and detailed information about the email event.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 bg-gray-50 p-8 dark:bg-gray-900">
						<div className="mb-4 font-mono text-sm">
							<div className="text-gray-600 dark:text-gray-400">
								# Example webhook payload
							</div>
							<div className="mt-2">{"{"}</div>
							<div className="ml-4">"id": "evt_1234567890",</div>
							<div className="ml-4">"type": "email.delivered",</div>
							<div className="ml-4">"created": 1640995200,</div>
							<div className="ml-4">"data": {"{"}</div>
							<div className="ml-8">"email_id": "em_1234567890",</div>
							<div className="ml-8">"to": "user@example.com",</div>
							<div className="ml-8">"from": "hello@yourdomain.com",</div>
							<div className="ml-8">"subject": "Welcome to Reloop!",</div>
							<div className="ml-8">"delivered_at": 1640995200,</div>
							<div className="ml-8">"recipient_ip": "192.168.1.1",</div>
							<div className="ml-8">"user_agent": "Mozilla/5.0...",</div>
							<div className="ml-4">{"}"}</div>
							<div>{"}"}</div>
						</div>
					</div>
				</div>
			</section>

			{/* Security */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Webhook Security</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Secure your webhook endpoints with signature verification and
							HTTPS enforcement to ensure data integrity and authenticity.
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
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">
								Signature Verification
							</h3>
							<p className="text-text-sub-600 leading-6">
								Verify webhook authenticity using HMAC-SHA256 signatures. Each
								webhook includes a signature header for verification.
							</p>
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
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">HTTPS Required</h3>
							<p className="text-text-sub-600 leading-6">
								All webhook endpoints must use HTTPS to ensure secure data
								transmission and protect sensitive information.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Set Up Webhooks?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Start receiving real-time notifications about your email campaigns.
					Configure webhooks in minutes and keep your applications synchronized.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Set Up Webhooks
					</Link>
					<Link
						href="/docs/api-reference"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						View API Reference
					</Link>
				</div>
			</section>
		</div>
	);
};

export default WebhooksPage;
