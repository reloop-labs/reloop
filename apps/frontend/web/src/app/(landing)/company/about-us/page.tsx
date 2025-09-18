import * as Button from "@reloop/ui/button";
import Link from "next/link";

const AboutUsPage = () => {
	return (
		<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
			{/* Hero Section */}
			<section className="px-6 py-20 text-center md:px-12 md:py-28">
				<h1 className="title-h1 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-transparent dark:from-white dark:to-gray-300">
					About Reloop
				</h1>
				<p className="mx-auto max-w-3xl text-text-sub-600 text-xl leading-8 md:text-2xl md:leading-9">
					We're on a mission to make email infrastructure simple, reliable, and
					accessible to everyone. Built by developers, for developers, with the
					power of open source.
				</p>
				<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						href="/careers"
						className={Button.buttonVariants({
							variant: "neutral",
						}).root({ className: "h-12 rounded-full px-8" })}
					>
						Join Our Team
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
						View Our Code
					</a>
				</div>
			</section>

			{/* Our Story */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 md:px-12 md:py-20">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="title-h2 mb-4 font-semibold">Our Story</h2>
						<p className="mx-auto max-w-2xl text-lg text-text-sub-600 leading-7">
							Born from frustration with existing email solutions, Reloop
							represents a new approach to email infrastructure.
						</p>
					</div>

					<div className="prose prose-lg dark:prose-invert mx-auto">
						<p className="text-text-sub-600 leading-8">
							Email infrastructure shouldn't be a barrier to innovation. Yet for
							years, developers have been forced to choose between expensive
							proprietary solutions, complex self-hosted setups, or unreliable
							free services. We knew there had to be a better way.
						</p>
						<p className="text-text-sub-600 leading-8">
							Founded in 2024 by a team of experienced engineers who had felt
							this pain firsthand, Reloop was built to solve real problems with
							elegant solutions. We believe that powerful tools should be simple
							to use, transparent in their operation, and accessible to teams of
							all sizes.
						</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="border-stroke-soft-100 border-t px-6 py-16 text-center md:px-12 md:py-20">
				<h2 className="title-h2 mb-6 font-semibold">Join Our Journey</h2>
				<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
					We're always looking for passionate people to join our mission.
					Whether you want to contribute code, join our team, or simply be part
					of our community, there's a place for you at Reloop.
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
						Contribute on GitHub
					</a>
				</div>
			</section>
		</div>
	);
};

export default AboutUsPage;
