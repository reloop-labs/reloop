import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Contact Us | Reloop",
	description:
		"Get in touch with the Reloop team. We're here to help with support, sales, partnerships, and any questions about our email infrastructure platform.",
	openGraph: {
		title: "Contact Us | Reloop",
		description:
			"Get in touch with the Reloop team. We're here to help with support, sales, partnerships, and any questions about our email infrastructure platform.",
		type: "website",
	},
};

const ContactUsPage = () => {
	const contactMethods = [
		{
			title: "General Support",
			description:
				"Get help with technical issues, account questions, and general support.",
			email: "support@reloop.sh",
			responseTime: "Within 24 hours",
			icon: "💬",
		},
		{
			title: "Sales & Partnerships",
			description:
				"Interested in our enterprise plans or partnership opportunities?",
			email: "sales@reloop.sh",
			responseTime: "Within 4 hours",
			icon: "🤝",
		},
		{
			title: "Technical Support",
			description:
				"Need help with API integration or technical implementation?",
			email: "tech@reloop.sh",
			responseTime: "Within 12 hours",
			icon: "⚡",
		},
		{
			title: "Press & Media",
			description:
				"Media inquiries, press releases, and partnership announcements.",
			email: "press@reloop.sh",
			responseTime: "Within 24 hours",
			icon: "📰",
		},
	];

	const faqs = [
		{
			question: "How quickly do you respond to support requests?",
			answer:
				"We typically respond to support requests within 24 hours, with priority support available for enterprise customers.",
		},
		{
			question: "Do you offer phone support?",
			answer:
				"Yes, we offer phone support for enterprise customers. Contact our sales team to learn more about our support tiers.",
		},
		{
			question: "Can I schedule a demo or consultation?",
			answer:
				"Absolutely! Contact our sales team at sales@reloop.sh to schedule a personalized demo of our platform.",
		},
		{
			question: "Do you have a community forum?",
			answer:
				"Yes, we have an active community forum where developers share tips, ask questions, and help each other.",
		},
	];

	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Contact Us
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					We're here to help! Whether you need technical support, have sales
					questions, or want to discuss partnerships, our team is ready to
					assist you.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started Free
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Schedule Demo
					</Link>
				</div>
			</section>

			{/* Contact Methods */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">How Can We Help?</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Choose the right contact method for your needs. We're committed to
						providing timely and helpful responses.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{contactMethods.map((method, index) => (
						<div
							key={index}
							className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm"
						>
							<div className="mb-4 text-4xl">{method.icon}</div>
							<h3 className="mb-3 font-semibold text-xl">{method.title}</h3>
							<p className="mb-4 text-text-sub-600 leading-6">
								{method.description}
							</p>
							<div className="mb-4">
								<a
									href={`mailto:${method.email}`}
									className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
								>
									{method.email}
								</a>
							</div>
							<div className="text-sm text-text-sub-600">
								Response time: {method.responseTime}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Contact Form */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Send Us a Message</h2>
						<p className="text-lg text-text-sub-600 leading-7">
							Prefer to send a message? Fill out the form below and we'll get
							back to you as soon as possible.
						</p>
					</div>

					<form className="space-y-6">
						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<label
									htmlFor="firstName"
									className="mb-2 block font-medium text-gray-900 dark:text-white"
								>
									First Name
								</label>
								<input
									type="text"
									id="firstName"
									name="firstName"
									required
									className="w-full rounded-lg border border-stroke-soft-100 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900"
								/>
							</div>
							<div>
								<label
									htmlFor="lastName"
									className="mb-2 block font-medium text-gray-900 dark:text-white"
								>
									Last Name
								</label>
								<input
									type="text"
									id="lastName"
									name="lastName"
									required
									className="w-full rounded-lg border border-stroke-soft-100 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="mb-2 block font-medium text-gray-900 dark:text-white"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								required
								className="w-full rounded-lg border border-stroke-soft-100 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900"
							/>
						</div>

						<div>
							<label
								htmlFor="company"
								className="mb-2 block font-medium text-gray-900 dark:text-white"
							>
								Company (Optional)
							</label>
							<input
								type="text"
								id="company"
								name="company"
								className="w-full rounded-lg border border-stroke-soft-100 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900"
							/>
						</div>

						<div>
							<label
								htmlFor="subject"
								className="mb-2 block font-medium text-gray-900 dark:text-white"
							>
								Subject
							</label>
							<select
								id="subject"
								name="subject"
								required
								className="w-full rounded-lg border border-stroke-soft-100 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900"
							>
								<option value="">Select a subject</option>
								<option value="general">General Support</option>
								<option value="sales">Sales & Partnerships</option>
								<option value="technical">Technical Support</option>
								<option value="billing">Billing Questions</option>
								<option value="feature">Feature Request</option>
								<option value="other">Other</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="message"
								className="mb-2 block font-medium text-gray-900 dark:text-white"
							>
								Message
							</label>
							<textarea
								id="message"
								name="message"
								rows={6}
								required
								className="w-full rounded-lg border border-stroke-soft-100 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-900"
								placeholder="Tell us how we can help you..."
							/>
						</div>

						<div className="text-center">
							<button
								type="submit"
								className={Button.buttonVariants({
									variant: "neutral",
								}).root({ className: "h-12 rounded-full px-8" })}
							>
								Send Message
							</button>
						</div>
					</form>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Frequently Asked Questions
						</h2>
						<p className="text-lg text-text-sub-600 leading-7">
							Quick answers to common questions about our support and contact
							process.
						</p>
					</div>

					<div className="space-y-6">
						{faqs.map((faq, index) => (
							<div
								key={index}
								className="rounded-xl border border-stroke-soft-100 p-6"
							>
								<h3 className="mb-3 font-semibold text-lg">{faq.question}</h3>
								<p className="text-text-sub-600 leading-7">{faq.answer}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Additional Resources */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">Need More Help?</h2>
					<p className="mb-10 text-lg text-text-sub-600 leading-8">
						Explore our resources and community to find answers and connect with
						other developers.
					</p>

					<div className="grid gap-6 md:grid-cols-3">
						<Link
							href="/docs"
							className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm"
						>
							<div className="mb-4 text-4xl">📚</div>
							<h3 className="mb-2 font-semibold text-lg">Documentation</h3>
							<p className="text-text-sub-600">
								Comprehensive guides and API references
							</p>
						</Link>

						<Link
							href="/community"
							className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm"
						>
							<div className="mb-4 text-4xl">💬</div>
							<h3 className="mb-2 font-semibold text-lg">Community Forum</h3>
							<p className="text-text-sub-600">
								Connect with other developers and get help
							</p>
						</Link>

						<Link
							href="/status"
							className="rounded-xl border border-stroke-soft-100 p-6 text-center transition-all hover:border-stroke-soft-200 hover:shadow-sm"
						>
							<div className="mb-4 text-4xl">📊</div>
							<h3 className="mb-2 font-semibold text-lg">Status Page</h3>
							<p className="text-text-sub-600">
								Check system status and uptime
							</p>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ContactUsPage;
