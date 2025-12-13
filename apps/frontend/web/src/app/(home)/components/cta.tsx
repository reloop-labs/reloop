import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

const CTA = () => {
	return (
		<section className="border-stroke-soft-100">
			<div className="relative mx-auto max-w-7xl flex-1 border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[05] GET STARTED</span>
					<span className="text-sm text-text-sub-600">
						/ START BUILDING TODAY
					</span>
				</div>
				<div className="grid grid-cols-2 p-20">
					<div className="flex-1 text-left">
						<h2 className="max-w-2xl font-semibold text-3xl text-text-strong-950">
							10K emails for free per month. <br />
							<span className="text-text-sub-600 leading-8">
								No credit card required.
							</span>
						</h2>
						<div className="flex flex-col gap-4 pt-6 sm:flex-row">
							<Link
								href="/contact"
								className={Button.buttonVariants({
									variant: "neutral",
									size: "xsmall",
								}).root({})}
							>
								Start for free
							</Link>
							<Link
								href="/pricing"
								className={Button.buttonVariants({
									mode: "stroke",
									variant: "neutral",
									size: "xsmall",
								}).root({})}
							>
								See our plans
							</Link>
						</div>
					</div>
					<div className="flex items-center justify-center">
						<Icon name="mail-single" className="h-40 w-40" />
					</div>
				</div>
			</div>
		</section>
	);
};

export default CTA;
