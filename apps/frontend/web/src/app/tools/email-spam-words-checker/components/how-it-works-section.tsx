"use client";

import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";

type HowItWorksCard = {
	step: string;
	title: string;
	description: string;
	dotColor: string;
	glowClass: string;
	code: string;
	lang: string;
	fileName: string;
};

const HOW_IT_WORKS_CARDS: HowItWorksCard[] = [
	{
		step: "01",
		title: "Scan trigger words & syntax",
		description:
			"We evaluate high-risk commercial phrases, deceptive guarantees, fake Re:/Fwd: prefixes, and uppercase ratios in real time.",
		dotColor: "#06b6d4",
		glowClass: "bg-cyan-500/15 dark:bg-cyan-500/20",
		lang: "typescript",
		fileName: "scanner.ts",
		code: `// 1. Scan content against trigger dictionary
const triggers = scanCopy(subject, body);
// => found: ["guaranteed 5% ROI", "ASAP"]
// => categories: ["overpromise", "urgency"]`,
	},
	{
		step: "02",
		title: "4-factor score breakdown",
		description:
			"Heuristic penalties are computed across subject health (25), content & copy (35), link safety (20), and text formatting (20).",
		dotColor: "#10b981",
		glowClass: "bg-emerald-500/15 dark:bg-emerald-500/20",
		lang: "bash",
		fileName: "breakdown.sh",
		code: `# 2. Heuristic scoring breakdown
✓ Subject Health: 20/25
✓ Content & Triggers: 15/35
✓ Link Safety: 20/20
✓ Format & Case Balance: 18/20`,
	},
	{
		step: "03",
		title: "Verdict & AI fix suggestion",
		description:
			"Receive an instant 0–100 deliverability grade, actionable recommendations, and one-click AI rewrite suggestions.",
		dotColor: "#ec4899",
		glowClass: "bg-pink-500/15 dark:bg-pink-500/20",
		lang: "json",
		fileName: "analysis.json",
		code: `{
  "score": 73,
  "grade": "C",
  "verdict": "needs_review",
  "verdictLabel": "Needs Review",
  "recommendations": [
    "Replace artificial urgency words with conversational phrasing."
  ]
}`,
	},
];

export function HowItWorksSection() {
	return (
		<section
			id="how-it-works"
			aria-labelledby="how-it-works-heading"
			className="w-full bg-bg-white-0 dark:bg-black"
		>
			{/* Section Header */}
			<div className="border-stroke-soft-200 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<h2
					id="how-it-works-heading"
					className="font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-white"
				>
					HOW IT WORKS
				</h2>
			</div>

			{/* 3 Step Cards Grid */}
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{HOW_IT_WORKS_CARDS.map((card) => {
					const si = getLanguageIcon(card.lang);
					return (
						<div
							key={card.step}
							className="relative flex flex-col justify-between overflow-hidden px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
						>
							{/* Halftone Dot Pattern Background */}
							<div
								aria-hidden
								className="pointer-events-none absolute inset-x-0 top-0 h-48"
								style={{
									backgroundImage: `radial-gradient(circle, ${card.dotColor} 1.4px, transparent 1.4px)`,
									backgroundSize: "14px 14px",
									maskImage:
										"linear-gradient(to bottom, black 25%, transparent 95%)",
									WebkitMaskImage:
										"linear-gradient(to bottom, black 25%, transparent 95%)",
									opacity: 0.38,
								}}
							/>

							{/* Soft Color Glow Behind the Dots */}
							<div
								aria-hidden
								className={cn(
									"-top-12 -left-12 pointer-events-none absolute size-48 rounded-full blur-[70px]",
									card.glowClass,
								)}
							/>

							<div className="relative z-10">
								{/* Step Number + Title */}
								<div className="mb-6 flex flex-col gap-1.5">
									<span className="font-mono text-[12px] text-text-soft-400 dark:text-white/40">
										{card.step}
									</span>
									<h3 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-[21px] dark:text-white">
										{card.title}
									</h3>
								</div>

								{/* CopyCodeBlock with Fixed Height */}
								<div className="mb-6 h-[162px]">
									<CopyCodeBlock
										code={card.code}
										lang={card.lang}
										title={card.fileName}
										si={si}
										hideLineNumbers={false}
										className="flex h-full flex-col justify-between"
									/>
								</div>

								{/* Description */}
								<p className="text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
									{card.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
