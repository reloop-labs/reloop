import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Email Glossary | Reloop",
	description:
		"Comprehensive glossary of email marketing and infrastructure terms. Learn about deliverability, authentication, analytics, and technical email concepts.",
	openGraph: {
		title: "Email Glossary | Reloop",
		description:
			"Comprehensive glossary of email marketing and infrastructure terms. Learn about deliverability, authentication, analytics, and technical email concepts.",
		type: "website",
	},
};

const GlossaryPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Email Glossary
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Master email infrastructure with our comprehensive glossary. From
					deliverability to authentication, understand every term that matters
					in email marketing and development.
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

			{/* Glossary Terms */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Essential Email Terms
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							From basic concepts to advanced technical terms, understand
							everything you need to know about email infrastructure.
						</p>
					</div>

					<div className="space-y-8">
						{/* A-C */}
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-6 font-semibold text-2xl text-blue-600 dark:text-blue-400">
								A - C
							</h3>
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<h4 className="mb-2 font-semibold text-lg">API</h4>
									<p className="text-text-sub-600 leading-6">
										Application Programming Interface. A set of protocols and
										tools for building software applications that communicate
										with email services.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Authentication</h4>
									<p className="text-text-sub-600 leading-6">
										The process of verifying the identity of an email sender
										using protocols like SPF, DKIM, and DMARC.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Bounce Rate</h4>
									<p className="text-text-sub-600 leading-6">
										The percentage of emails that could not be delivered to
										recipients due to invalid addresses or other issues.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										Click-through Rate (CTR)
									</h4>
									<p className="text-text-sub-600 leading-6">
										The percentage of email recipients who clicked on one or
										more links contained in an email message.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										Content Filtering
									</h4>
									<p className="text-text-sub-600 leading-6">
										The process of analyzing email content to determine if it
										should be delivered, flagged as spam, or blocked.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										Conversion Rate
									</h4>
									<p className="text-text-sub-600 leading-6">
										The percentage of email recipients who completed a desired
										action, such as making a purchase or signing up for a
										service.
									</p>
								</div>
							</div>
						</div>

						{/* D-F */}
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-6 font-semibold text-2xl text-green-600 dark:text-green-400">
								D - F
							</h3>
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<h4 className="mb-2 font-semibold text-lg">Deliverability</h4>
									<p className="text-text-sub-600 leading-6">
										The ability of an email to reach the recipient's inbox
										without being filtered into spam or blocked.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">DKIM</h4>
									<p className="text-text-sub-600 leading-6">
										DomainKeys Identified Mail. An email authentication method
										that uses digital signatures to verify email authenticity.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">DMARC</h4>
									<p className="text-text-sub-600 leading-6">
										Domain-based Message Authentication, Reporting, and
										Conformance. A policy framework for email authentication.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Email Client</h4>
									<p className="text-text-sub-600 leading-6">
										Software applications used to read, send, and manage email
										messages, such as Gmail, Outlook, or Apple Mail.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										Email Service Provider (ESP)
									</h4>
									<p className="text-text-sub-600 leading-6">
										A company that provides email marketing and transactional
										email services to businesses and organizations.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Feedback Loop</h4>
									<p className="text-text-sub-600 leading-6">
										A system that allows ISPs to report spam complaints back to
										email senders to help maintain sender reputation.
									</p>
								</div>
							</div>
						</div>

						{/* G-M */}
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-6 font-semibold text-2xl text-purple-600 dark:text-purple-400">
								G - M
							</h3>
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<h4 className="mb-2 font-semibold text-lg">Hard Bounce</h4>
									<p className="text-text-sub-600 leading-6">
										A permanent email delivery failure due to invalid email
										addresses or blocked domains.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">IP Reputation</h4>
									<p className="text-text-sub-600 leading-6">
										A score assigned to an IP address based on its email sending
										history and spam complaints.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">List Hygiene</h4>
									<p className="text-text-sub-600 leading-6">
										The practice of regularly cleaning email lists to remove
										invalid, inactive, or unengaged subscribers.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										Mail Transfer Agent (MTA)
									</h4>
									<p className="text-text-sub-600 leading-6">
										Software that transfers email messages between servers using
										the SMTP protocol.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Open Rate</h4>
									<p className="text-text-sub-600 leading-6">
										The percentage of email recipients who opened an email
										message, calculated by tracking pixel downloads.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">MIME</h4>
									<p className="text-text-sub-600 leading-6">
										Multipurpose Internet Mail Extensions. A standard for
										formatting email messages to support text, HTML, and
										attachments.
									</p>
								</div>
							</div>
						</div>

						{/* N-S */}
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-6 font-semibold text-2xl text-orange-600 dark:text-orange-400">
								N - S
							</h3>
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<h4 className="mb-2 font-semibold text-lg">Opt-in</h4>
									<p className="text-text-sub-600 leading-6">
										The process by which users explicitly consent to receive
										email communications from a sender.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Opt-out</h4>
									<p className="text-text-sub-600 leading-6">
										The process by which users request to stop receiving email
										communications from a sender.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Reputation</h4>
									<p className="text-text-sub-600 leading-6">
										A score that ISPs assign to email senders based on their
										sending practices and recipient engagement.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">SMTP</h4>
									<p className="text-text-sub-600 leading-6">
										Simple Mail Transfer Protocol. The standard protocol for
										sending email messages between servers.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Soft Bounce</h4>
									<p className="text-text-sub-600 leading-6">
										A temporary email delivery failure due to issues like full
										mailbox or server problems.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">SPF</h4>
									<p className="text-text-sub-600 leading-6">
										Sender Policy Framework. An email authentication method that
										specifies which servers are authorized to send emails for a
										domain.
									</p>
								</div>
							</div>
						</div>

						{/* T-Z */}
						<div className="rounded-xl border border-stroke-soft-100 p-8">
							<h3 className="mb-6 font-semibold text-2xl text-red-600 dark:text-red-400">
								T - Z
							</h3>
							<div className="grid gap-6 md:grid-cols-2">
								<div>
									<h4 className="mb-2 font-semibold text-lg">
										Transactional Email
									</h4>
									<p className="text-text-sub-600 leading-6">
										Automated emails triggered by user actions, such as password
										resets, order confirmations, or welcome messages.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Unsubscribe</h4>
									<p className="text-text-sub-600 leading-6">
										The process by which email recipients remove themselves from
										an email list to stop receiving future messages.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Webhook</h4>
									<p className="text-text-sub-600 leading-6">
										A mechanism for real-time communication between applications
										by sending HTTP POST requests when events occur.
									</p>
								</div>
								<div>
									<h4 className="mb-2 font-semibold text-lg">Whitelist</h4>
									<p className="text-text-sub-600 leading-6">
										A list of trusted email addresses or domains that are
										allowed to bypass spam filters.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Ready to Master Email?</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Now that you understand the terminology, start building with Reloop.
					Get access to all the tools and infrastructure you need for successful
					email delivery.
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

export default GlossaryPage;
