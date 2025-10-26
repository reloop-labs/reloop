import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Email Templates | Reloop",
	description:
		"Beautiful, responsive email templates for every use case. Choose from our library of pre-built templates or create custom designs with our drag-and-drop editor.",
	openGraph: {
		title: "Email Templates | Reloop",
		description:
			"Beautiful, responsive email templates for every use case. Choose from our library of pre-built templates or create custom designs with our drag-and-drop editor.",
		type: "website",
	},
};

const EmailTemplatesPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Email Templates
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Create stunning emails with our library of professional templates.
					Choose from pre-built designs or build custom templates with our
					intuitive drag-and-drop editor.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Creating
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Browse Templates
					</Link>
				</div>
			</section>

			{/* Template Categories */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Templates for Every Need
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						From newsletters to transactional emails, find the perfect template
						for your use case with our curated collection of professional
						designs.
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
									d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Newsletters</h3>
						<p className="text-text-sub-600 leading-6">
							Professional newsletter templates with engaging layouts, social
							media integration, and mobile-responsive designs.
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
									d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">E-commerce</h3>
						<p className="text-text-sub-600 leading-6">
							Product showcase templates, order confirmations, and shopping cart
							abandonment emails designed to drive conversions.
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
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Transactional</h3>
						<p className="text-text-sub-600 leading-6">
							Clean, professional templates for receipts, confirmations,
							password resets, and other critical communications.
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
									d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Marketing</h3>
						<p className="text-text-sub-600 leading-6">
							High-converting marketing templates for promotions, product
							launches, and seasonal campaigns with compelling CTAs.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20">
							<svg
								className="h-6 w-6 text-pink-600 dark:text-pink-400"
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
						<h3 className="mb-3 font-semibold text-xl">Welcome Series</h3>
						<p className="text-text-sub-600 leading-6">
							Onboarding email sequences that guide new users through your
							product with engaging, step-by-step templates.
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
							<svg
								className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Custom Templates</h3>
						<p className="text-text-sub-600 leading-6">
							Build your own templates from scratch with our drag-and-drop
							editor, or upload your existing HTML designs.
						</p>
					</div>
				</div>
			</section>

			{/* Template Editor Features */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							Powerful Template Editor
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Create beautiful emails with our intuitive drag-and-drop editor.
							No coding required—just drag, drop, and customize to match your
							brand.
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
											d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									Drag & Drop Builder
								</h3>
								<p className="text-text-sub-600 leading-7">
									Build emails visually with our intuitive drag-and-drop editor.
									Add text blocks, images, buttons, and more with simple clicks
									and drags.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:from-blue-900/20 dark:to-indigo-900/20">
									<div className="text-4xl">🎨</div>
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
											d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									Mobile Responsive
								</h3>
								<p className="text-text-sub-600 leading-7">
									All templates are automatically optimized for mobile devices.
									Preview your emails across different screen sizes and ensure
									perfect rendering everywhere.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:from-green-900/20 dark:to-emerald-900/20">
									<div className="text-4xl">📱</div>
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
											d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
										/>
									</svg>
								</div>
								<h3 className="mb-4 font-semibold text-2xl">
									Brand Customization
								</h3>
								<p className="text-text-sub-600 leading-7">
									Customize colors, fonts, and layouts to match your brand
									identity. Save brand presets and apply them across all your
									email templates.
								</p>
							</div>
							<div className="md:w-1/2">
								<div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-8 dark:from-purple-900/20 dark:to-pink-900/20">
									<div className="text-4xl">🎯</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">
					Ready to Create Beautiful Emails?
				</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Start building professional email templates with Reloop's powerful
					editor. Choose from our library or create custom designs that match
					your brand perfectly.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Start Creating
					</Link>
					<Link
						href="/demo"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Browse Template Library
					</Link>
				</div>
			</section>
		</div>
	);
};

export default EmailTemplatesPage;
