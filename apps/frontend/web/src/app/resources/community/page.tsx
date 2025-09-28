import * as Button from "@reloop/ui/button";

const CommunityPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					Join the Reloop Community
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					Connect with developers, share knowledge, and help shape the future of
					email infrastructure. Our community is the heart of everything we do.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						target="_blank"
						href="https://discord.gg/reloop"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						Join Discord
					</a>
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						Contribute on GitHub
					</a>
				</div>
			</section>

			{/* Community Platforms */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mb-16 text-center">
					<h2 className="title-h2 mb-4 font-semibold">
						Where Our Community Connects
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
						Find us across multiple platforms where developers share ideas, ask
						questions, and collaborate on making email infrastructure better.
					</p>
				</div>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
							<svg
								className="h-6 w-6 text-purple-600 dark:text-purple-400"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Discord Community</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Join our active Discord server for real-time discussions, support,
							and community events. Get help from both the team and fellow
							developers.
						</p>
						<a
							target="_blank"
							href="https://discord.gg/reloop"
							className="text-blue-600 text-sm hover:underline dark:text-blue-400"
							rel="noopener"
						>
							Join Discord →
						</a>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900/20">
							<svg
								className="h-6 w-6 text-gray-600 dark:text-gray-400"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">GitHub Discussions</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Participate in GitHub Discussions for feature requests, technical
							discussions, and project planning. Shape the roadmap with your
							input.
						</p>
						<a
							target="_blank"
							href="https://github.com/reloop-labs/reloop/discussions"
							className="text-blue-600 text-sm hover:underline dark:text-blue-400"
							rel="noopener"
						>
							View Discussions →
						</a>
					</div>

					<div className="rounded-xl border border-stroke-soft-100 p-8 transition-all hover:border-stroke-soft-200 hover:shadow-sm">
						<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
							<svg
								className="h-6 w-6 text-blue-600 dark:text-blue-400"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-xl">Twitter Community</h3>
						<p className="mb-4 text-text-sub-600 leading-6">
							Follow us on Twitter for updates, tips, and community highlights.
							Share your Reloop success stories and connect with other users.
						</p>
						<a
							target="_blank"
							href="https://twitter.com/reloophq"
							className="text-blue-600 text-sm hover:underline dark:text-blue-400"
							rel="noopener"
						>
							Follow @reloophq →
						</a>
					</div>
				</div>
			</section>

			{/* Community Stats */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="title-h2 mb-6 font-semibold">A Growing Community</h2>
					<p className="mb-12 text-lg text-text-sub-600 leading-8">
						Join thousands of developers who are already part of the Reloop
						community and help shape the future of email infrastructure.
					</p>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-blue-600 dark:text-blue-400">
								2,500+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Discord Members
							</div>
							<div className="text-sm text-text-sub-600">
								Active daily discussions
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-green-600 dark:text-green-400">
								1,200+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								GitHub Stars
							</div>
							<div className="text-sm text-text-sub-600">
								And growing every day
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-purple-600 dark:text-purple-400">
								150+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Contributors
							</div>
							<div className="text-sm text-text-sub-600">
								From around the world
							</div>
						</div>
						<div className="text-center">
							<div className="mb-4 font-bold text-4xl text-orange-600 dark:text-orange-400">
								50+
							</div>
							<div className="font-medium text-gray-900 dark:text-white">
								Countries
							</div>
							<div className="text-sm text-text-sub-600">
								Global community reach
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Ready to Get Involved?</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					Whether you're looking for help, want to contribute code, or just want
					to connect with like-minded developers, there's a place for you in our
					community.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						target="_blank"
						href="https://discord.gg/reloop"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						Join Discord
					</a>
					<a
						target="_blank"
						href="https://github.com/reloop-labs/reloop"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
						rel="noopener"
					>
						Star on GitHub
					</a>
				</div>
			</section>
		</div>
	);
};

export default CommunityPage;
