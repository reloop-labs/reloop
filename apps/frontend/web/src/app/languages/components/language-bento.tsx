import type { LanguageDefinition } from "../languages";

const CAPABILITIES = (language: LanguageDefinition) =>
	[
		{
			label: "Idiomatic design",
			title: `Native ${language.name} client patterns`,
			body: `Respects established conventions—predictable errors, strict typing, and full support for ${language.primaryFramework}.`,
			footer: language.highlights.join(" · "),
		},
		{
			label: "Performance",
			title: "Sub-50ms handoff",
			body: "HTTP requests route through Reloop edge proxies with persistent connection pools.",
			footer: `Concurrency: ${language.concurrency}`,
		},
		{
			label: "Webhooks",
			title: "Signed event payloads",
			body: `Cryptographically verify delivery, bounce, and open webhooks inside your ${language.name} handlers.`,
			footer: "HMAC-SHA256 verification",
		},
		{
			label: "Reliability",
			title: "Production security & observability",
			body: "Domain verification helpers, rate-limit state, request IDs, and structured logging hooks.",
			footer: "SOC 2 Type II · 99.99% uptime SLA",
		},
	] as const;

export default function LanguageBento({
	language,
}: {
	language: LanguageDefinition;
}) {
	const cards = CAPABILITIES(language);

	return (
		<section
			id="capabilities"
			className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/[0.04] via-sky-400/[0.02] to-transparent dark:from-blue-500/[0.08] dark:via-transparent" />

			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-12 sm:px-10 sm:py-14 lg:px-12 dark:border-white/10">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						Built for {language.name}
					</p>
					<h2 className="mt-2 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Engineered natively for {language.name}.
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						High concurrency, clear error surfaces, and a developer experience
						that stays out of the way in production.
					</p>
				</div>

				{/* 2×2 grid — careers values pattern */}
				<div className="grid grid-cols-1 border-stroke-soft-200 md:grid-cols-2 dark:border-white/10">
					{cards.map((card, i) => {
						const isRight = i % 2 === 1;
						const isBottom = i >= 2;
						return (
							<div
								key={card.label}
								className={`flex flex-col justify-between p-8 sm:p-10 lg:p-12 ${
									!isRight
										? "border-stroke-soft-200 md:border-r dark:border-white/10"
										: ""
								} ${
									!isBottom
										? "border-stroke-soft-200 border-b dark:border-white/10"
										: ""
								}`}
							>
								<div>
									<p className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
										{card.label}
									</p>
									<h3 className="mt-2.5 font-semibold text-[1.05rem] text-text-strong-950 tracking-tight sm:text-[1.15rem] dark:text-white">
										{card.title}
									</h3>
									<p className="mt-2.5 max-w-md text-sm text-text-sub-600 leading-relaxed dark:text-white/60">
										{card.body}
									</p>
								</div>
								<p className="mt-6 font-mono text-[11px] text-text-sub-600 dark:text-white/45">
									{card.footer}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
