import * as Button from "@reloop/ui/components/button";

export default function Home() {
	return (
		<div>
			<h1 className="title-h3 mt-20 text-center font-medium leading-[60px] tracking-tight">
				Email for Developers & Marketing teams
			</h1>
			<h2 className="mx-auto mt-6 max-w-lg text-center text-lg text-text-sub-600 leading-8">
				Reloop secure, reliable, and scalable email infrastructure ensuring
				99.9% inbox placement, not spam.{" "}
			</h2>

			<div className="mt-10 flex items-center justify-center gap-4">
				<Button.Root variant="neutral" className="h-12 rounded-full px-6">
					Get Early Access
				</Button.Root>
				<Button.Root
					mode="stroke"
					variant="neutral"
					className="h-12 rounded-full px-6"
				>
					View on GitHub
				</Button.Root>
			</div>
		</div>
	);
}
