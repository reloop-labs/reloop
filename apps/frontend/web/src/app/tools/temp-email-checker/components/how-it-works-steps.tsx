import Link from "next/link";

const STEPS = [
	{
		title: "1. Paste an email address",
		description:
			"Drop in any address or bare domain — no account, no API key, no setup.",
	},
	{
		title: "2. We check syntax, catalogue & DNS",
		description:
			"We validate the shape, match a ~210k disposable catalogue with wildcard suffixes and role prefixes, then resolve MX records. We never probe the mailbox.",
	},
	{
		title: "3. Get an instant verdict",
		description:
			"Disposable or legit, with confidence, risk score, and flags — right in your browser. Need it in code? Use the API.",
		link: { label: "Start for free", href: "/dashboard/signup" },
	},
];

export function HowItWorksSteps() {
	return (
		<section
			id="how-it-works"
			aria-labelledby="how-it-works-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<h2
					id="how-it-works-heading"
					className="text-balance font-semibold text-2xl text-text-strong-950 tracking-[-0.025em] sm:text-3xl lg:text-[2rem] lg:leading-[1.15] dark:text-white"
				>
					How <span className="text-rose-600 dark:text-rose-300">Reloop&rsquo;s</span>{" "}
					free Temp Email Checker works:
				</h2>
			</div>

			<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-b lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10 dark:border-white/10">
				{STEPS.map((step) => (
					<div
						key={step.title}
						className="flex flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
					>
						<h3 className="text-balance font-semibold text-text-strong-950 text-[18px] tracking-[-0.025em] sm:text-[19px] dark:text-white">
							{step.title}
						</h3>
						<p className="mt-3 text-[13.5px] text-stone-500 leading-relaxed sm:text-[14px] dark:text-white/60">
							{step.description}
						</p>
						{step.link && (
							<Link
								href={step.link.href}
								className="mt-4 inline-flex items-center gap-1 font-medium text-[14.5px] text-rose-600 transition-colors hover:text-rose-700 sm:text-[15px] dark:text-rose-300 dark:hover:text-rose-200"
							>
								<span>{step.link.label}</span>
								<span aria-hidden>→</span>
							</Link>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
