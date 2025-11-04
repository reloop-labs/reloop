import * as Button from "@reloop/ui/button";
import Link from "next/link";

const CTA = () => {
	return (
		<section className="border-stroke-soft-100">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[05] GET STARTED</span>
					<span className="text-sm text-text-sub-600">
						/ START BUILDING TODAY
					</span>
				</div>
				<div className="px-6 py-16 text-center md:px-12 md:py-20">
					<h2 className="title-h2 mb-6 font-semibold">Start Wiht</h2>
					<p className="mx-auto mb-10 max-w-2xl text-lg text-text-sub-600 leading-8">
						Join thousands of developers and marketing teams who trust Reloop
						for their email infrastructure. Get started in minutes, not months.
					</p>
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link
							href="/contact"
							className={Button.buttonVariants({
								variant: "neutral",
							}).root({ className: "h-12 rounded-full px-8" })}
						>
							Get Early Access
						</Link>
						<Link
							href="https://github.com/reloop-labs/reloop"
							target="_blank"
							rel="noopener noreferrer"
							className={Button.buttonVariants({
								mode: "stroke",
								variant: "neutral",
							}).root({ className: "h-12 rounded-full px-8" })}
						>
							View on GitHub
						</Link>
						<Link
							href="/docs/getting-started"
							className={Button.buttonVariants({
								mode: "ghost",
								variant: "neutral",
							}).root({ className: "h-12 rounded-full px-8" })}
						>
							Read the Docs
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CTA;
