import * as Button from "@reloop/ui/button";
import Link from "next/link";

export default function Home() {
	return (
		<div>
			<h1 className="title-h2 mx-auto mt-20 max-w-xl text-center font-semibold">
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
					}).root({})}
				>
					Get Early Access
				</Link>
				<a
					target="_blank"
					href="https://github.com/reloop-labs/reloop"
					className={Button.buttonVariants({
						mode: "stroke",
						variant: "neutral",
					}).root({})}
					rel="noopener"
				>
					View it on GitHub
				</a>
			</div>
		</div>
	);
}
