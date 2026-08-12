import Link from "next/link";
import type { LanguageDefinition } from "../languages";

export default function LanguageGuide({
	language,
}: {
	language: LanguageDefinition;
}) {
	const steps: {
		n: string;
		title: string;
		body: string;
		detail: string;
		isCode: boolean;
		href?: string;
	}[] = [
		{
			n: "01",
			title: "Install the package",
			body: `Add the official ${language.name} client to your project dependencies.`,
			detail: language.installCommand,
			isCode: true,
		},
		{
			n: "02",
			title: "Set your API key",
			body: "Export your secret key from the Reloop dashboard into your environment.",
			detail: 'RELOOP_API_KEY="re_..."',
			isCode: true,
		},
		{
			n: "03",
			title: "Send a message",
			body: "Call the SDK send method with HTML content and a recipient address.",
			detail: `Read the ${language.name} docs →`,
			isCode: false,
			href: language.docsPath,
		},
	];

	return (
		<section
			id="guide"
			className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-12 sm:px-10 sm:py-14 lg:px-12 dark:border-white/10">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						Quickstart · 3 steps
					</p>
					<h2 className="mt-2 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Integrate {language.name} in under 5 minutes.
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						From install to first send—minimal setup, no ceremony.
					</p>
				</div>

				{/* Steps */}
				<div className="grid grid-cols-1 md:grid-cols-3">
					{steps.map((step, i) => (
						<div
							key={step.n}
							className={`flex flex-col justify-between p-6 sm:p-8 lg:p-10 ${
								i < 2
									? "border-stroke-soft-200 border-b md:border-r md:border-b-0 dark:border-white/10"
									: ""
							}`}
						>
							<div>
								<span className="font-mono font-semibold text-[11px] text-text-sub-600 tabular-nums dark:text-white/40">
									STEP {step.n}
								</span>
								<h3 className="mt-2 font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-base dark:text-white">
									{step.title}
								</h3>
								<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
									{step.body}
								</p>
							</div>

							<div className="mt-5">
								{step.isCode || !step.href ? (
									<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3 py-2 font-mono text-[12px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
										{step.detail}
									</div>
								) : (
									<Link
										href={step.href}
										className="inline-flex items-center font-medium text-[13px] text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
									>
										{step.detail}
									</Link>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
