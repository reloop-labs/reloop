import * as Button from "@reloop/ui/button";
import Link from "next/link";

export default function Home() {
	return (
		<div>
			<h1 className="title-h3 mt-20 text-center font-medium leading-[60px] tracking-tight">
				Email for Developers & Marketing teams
			</h1>
			<h2 className="mx-auto mt-6 max-w-lg text-center text-lg text-text-sub-600 leading-8">
				Reloop provides secure, reliable, and scalable email infrastructure with
				99.9% inbox placement never spam.{" "}
			</h2>

			<div className="mt-10 flex items-center justify-center gap-4">
				<Link
					href="/contact"
					className={Button.buttonVariants({
						variant: "neutral",
					}).root({ className: "h-12 rounded-full px-6" })}
				>
					Get Early Access
				</Link>
				<a
					target="_blank"
					href="https://github.com/reloop-labs/reloop"
					className={Button.buttonVariants({
						mode: "stroke",
						variant: "neutral",
					}).root({ className: "h-12 rounded-full px-6" })}
					rel="noopener"
				>
					View it on GitHub
				</a>
			</div>
		</div>
	);
}
