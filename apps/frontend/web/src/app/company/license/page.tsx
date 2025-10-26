import * as Button from "@reloop/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "License | Reloop",
	description:
		"Reloop is released under the MIT License. Learn about our open source licensing terms and how you can use, modify, and distribute our software.",
	openGraph: {
		title: "License | Reloop",
		description:
			"Reloop is released under the MIT License. Learn about our open source licensing terms and how you can use, modify, and distribute our software.",
		type: "website",
	},
};

const LicensePage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					MIT License
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Reloop is released under the MIT License, one of the most permissive
					open source licenses. Use it freely in your projects, both commercial
					and non-commercial.
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
						href="/get-started"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started
					</Link>
				</div>
			</section>

			{/* License Overview */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-12 text-center">
						<h2 className="title-h2 mb-4 font-semibold">
							What the MIT License Means
						</h2>
						<p className="text-lg text-text-sub-600 leading-7">
							The MIT License is simple, permissive, and business-friendly.
							Here's what it means for you and your projects.
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
							<h3 className="mb-3 font-semibold text-xl">Commercial Use</h3>
							<p className="text-text-sub-600 leading-6">
								Use Reloop in commercial projects without any restrictions.
								Build and sell products that incorporate our code.
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
										d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Modification</h3>
							<p className="text-text-sub-600 leading-6">
								Modify the source code to fit your needs. Customize features,
								fix bugs, or add new functionality.
							</p>
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
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Distribution</h3>
							<p className="text-text-sub-600 leading-6">
								Distribute copies of Reloop, including modified versions, to
								anyone you want.
							</p>
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
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<h3 className="mb-3 font-semibold text-xl">Private Use</h3>
							<p className="text-text-sub-600 leading-6">
								Use Reloop privately in your own projects without any
								obligations to share your modifications.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Full License Text */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8">
						<h2 className="title-h2 mb-4 font-semibold">MIT License Text</h2>
						<p className="text-text-sub-600 leading-7">
							Here's the complete MIT License text that applies to Reloop:
						</p>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 bg-gray-50 p-8 dark:bg-gray-900">
						<pre className="whitespace-pre-wrap text-gray-800 text-sm leading-7 dark:text-gray-200">
							{`MIT License

Copyright (c) 2024 Reloop Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
						</pre>
					</div>
				</div>
			</section>

			{/* Third-Party Licenses */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8">
						<h2 className="title-h2 mb-4 font-semibold">
							Third-Party Licenses
						</h2>
						<p className="text-text-sub-600 leading-7">
							Reloop uses several open source libraries and frameworks. Here are
							the main dependencies and their licenses:
						</p>
					</div>

					<div className="space-y-6">
						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-lg">React & Next.js</h3>
									<p className="text-text-sub-600">
										MIT License - UI framework and server-side rendering
									</p>
								</div>
								<span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
									MIT
								</span>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-lg">TypeScript</h3>
									<p className="text-text-sub-600">
										Apache License 2.0 - Type safety and development tools
									</p>
								</div>
								<span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 text-sm dark:bg-blue-900/30 dark:text-blue-400">
									Apache 2.0
								</span>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-lg">Tailwind CSS</h3>
									<p className="text-text-sub-600">
										MIT License - Utility-first CSS framework
									</p>
								</div>
								<span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800 text-sm dark:bg-green-900/30 dark:text-green-400">
									MIT
								</span>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-lg">PostgreSQL</h3>
									<p className="text-text-sub-600">
										PostgreSQL License - Database system
									</p>
								</div>
								<span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 text-sm dark:bg-purple-900/30 dark:text-purple-400">
									PostgreSQL
								</span>
							</div>
						</div>
					</div>

					<div className="mt-8 text-center">
						<p className="text-text-sub-600">
							For a complete list of dependencies and their licenses, see our{" "}
							<a
								href="https://github.com/reloop-labs/reloop/blob/main/package.json"
								target="_blank"
								rel="noopener"
								className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								package.json
							</a>{" "}
							file on GitHub.
						</p>
					</div>
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
							Common questions about using Reloop in your projects.
						</p>
					</div>

					<div className="space-y-8">
						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<h3 className="mb-3 font-semibold text-lg">
								Can I use Reloop in my commercial project?
							</h3>
							<p className="text-text-sub-600 leading-7">
								Yes! The MIT License explicitly allows commercial use. You can
								build and sell products that incorporate Reloop without any
								restrictions or obligations to share your code.
							</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<h3 className="mb-3 font-semibold text-lg">
								Do I need to include the license in my project?
							</h3>
							<p className="text-text-sub-600 leading-7">
								Yes, you should include the MIT License text and copyright
								notice in your project. This is a simple requirement that helps
								maintain the open source ecosystem.
							</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<h3 className="mb-3 font-semibold text-lg">
								Can I modify Reloop and not share my changes?
							</h3>
							<p className="text-text-sub-600 leading-7">
								Yes, you can modify Reloop for private use without sharing your
								changes. However, if you distribute the modified version, you
								should include the original license and copyright notice.
							</p>
						</div>

						<div className="rounded-xl border border-stroke-soft-100 p-6">
							<h3 className="mb-3 font-semibold text-lg">
								What if I want to contribute back to Reloop?
							</h3>
							<p className="text-text-sub-600 leading-7">
								We welcome contributions! Check out our{" "}
								<a
									href="https://github.com/reloop-labs/reloop/blob/main/CONTRIBUTING.md"
									target="_blank"
									rel="noopener"
									className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
								>
									contributing guidelines
								</a>{" "}
								on GitHub to learn how to submit pull requests and help improve
								Reloop for everyone.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Ready to Use Reloop?</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Start building with Reloop today. The MIT License gives you complete
					freedom to use, modify, and distribute our email infrastructure
					platform.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/get-started"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Get Started Free
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
						View Source Code
					</a>
				</div>
			</section>
		</div>
	);
};

export default LicensePage;
