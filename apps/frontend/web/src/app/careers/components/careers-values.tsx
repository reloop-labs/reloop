import type { ReactNode } from "react";

type ValueItem = {
	title: string;
	description: string;
	renderDiagram: (id: string) => ReactNode;
};

function BlueprintGrid({ id }: { id: string }) {
	const patternId = `blueprint-grid-${id}`;
	return (
		<svg
			className="pointer-events-none absolute inset-0 size-full text-stroke-soft-200/80 dark:text-white/[0.06]"
			width="100%"
			height="100%"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<defs>
				<pattern
					id={patternId}
					width="16"
					height="16"
					patternUnits="userSpaceOnUse"
				>
					<path
						d="M 16 0 L 0 0 0 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.75"
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill={`url(#${patternId})`} />
		</svg>
	);
}

const values: ValueItem[] = [
	{
		title: "Build with love.",
		description:
			"We believe in building with heart, creating something that not only works but feels thoughtfully crafted.",
		renderDiagram: (id) => (
			<div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden border border-stroke-soft-200/80 bg-[#fafafa] sm:size-32 dark:border-white/10 dark:bg-white/[0.02]">
				<BlueprintGrid id={id} />
				<svg
					viewBox="0 0 100 100"
					className="relative z-10 size-20 text-text-strong-950/80 sm:size-24 dark:text-white/85"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					{/* Dashed Heart contour */}
					<path
						d="M50 78 L23 51 C12 40 14 22 28 16 C38 12 46 20 50 26 C54 20 62 12 72 16 C86 22 88 40 77 51 Z"
						stroke="currentColor"
						strokeWidth="1.25"
						strokeDasharray="3 3"
					/>
					{/* Solid Diamond */}
					<rect
						x="30"
						y="30"
						width="40"
						height="40"
						transform="rotate(45 50 50)"
						stroke="currentColor"
						strokeWidth="1.25"
					/>
					{/* Center Cross */}
					<path
						d="M48 50h4M50 48v4"
						stroke="currentColor"
						strokeWidth="1"
						strokeLinecap="round"
					/>
				</svg>
			</div>
		),
	},
	{
		title: "Context over control.",
		description:
			"We build trust in individuals to make decisions and move forward without rigid hierarchy.",
		renderDiagram: (id) => (
			<div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden border border-stroke-soft-200/80 bg-[#fafafa] sm:size-32 dark:border-white/10 dark:bg-white/[0.02]">
				<BlueprintGrid id={id} />
				<svg
					viewBox="0 0 100 100"
					className="relative z-10 size-20 text-text-strong-950/80 sm:size-24 dark:text-white/85"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					{/* Dashed Triangle */}
					<polygon
						points="50,22 18,76 82,76"
						stroke="currentColor"
						strokeWidth="1.25"
						strokeDasharray="3 3"
					/>
					{/* Solid Circle */}
					<circle
						cx="50"
						cy="46"
						r="18"
						stroke="currentColor"
						strokeWidth="1.25"
					/>
					{/* Center Cross */}
					<path
						d="M48 46h4M50 44v4"
						stroke="currentColor"
						strokeWidth="1"
						strokeLinecap="round"
					/>
				</svg>
			</div>
		),
	},
	{
		title: "Challenge ideas, not people.",
		description:
			"We always keep the focus on challenging ideas, not the individuals behind them.",
		renderDiagram: (id) => (
			<div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden border border-stroke-soft-200/80 bg-[#fafafa] sm:size-32 dark:border-white/10 dark:bg-white/[0.02]">
				<BlueprintGrid id={id} />
				<svg
					viewBox="0 0 100 100"
					className="relative z-10 size-20 text-text-strong-950/80 sm:size-24 dark:text-white/85"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					{/* Dashed 8-point radiating Star */}
					<path
						d="M50 14 L57 33 L76 24 L67 43 L86 50 L67 57 L76 76 L57 67 L50 86 L43 67 L24 76 L33 57 L14 50 L33 43 L24 24 L43 33 Z"
						stroke="currentColor"
						strokeWidth="1.25"
						strokeDasharray="3 3"
					/>
					{/* Solid Circle */}
					<circle
						cx="50"
						cy="50"
						r="18"
						stroke="currentColor"
						strokeWidth="1.25"
					/>
					{/* Center Cross */}
					<path
						d="M48 50h4M50 48v4"
						stroke="currentColor"
						strokeWidth="1"
						strokeLinecap="round"
					/>
				</svg>
			</div>
		),
	},
	{
		title: "Break it down, amp it up.",
		description:
			"We encourage bold, creative ideas that go beyond the limits of what's achievable.",
		renderDiagram: (id) => (
			<div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden border border-stroke-soft-200/80 bg-[#fafafa] sm:size-32 dark:border-white/10 dark:bg-white/[0.02]">
				<BlueprintGrid id={id} />
				<svg
					viewBox="0 0 100 100"
					className="relative z-10 size-20 text-text-strong-950/80 sm:size-24 dark:text-white/85"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
				>
					{/* Dashed Rotated Squares */}
					<rect
						x="30"
						y="30"
						width="40"
						height="40"
						transform="rotate(14 50 50)"
						stroke="currentColor"
						strokeWidth="1.25"
						strokeDasharray="3 3"
					/>
					<rect
						x="30"
						y="30"
						width="40"
						height="40"
						transform="rotate(-14 50 50)"
						stroke="currentColor"
						strokeWidth="1.25"
						strokeDasharray="3 3"
					/>
					{/* Solid Square */}
					<rect
						x="30"
						y="30"
						width="40"
						height="40"
						stroke="currentColor"
						strokeWidth="1.25"
					/>
					{/* Center Cross */}
					<path
						d="M48 50h4M50 48v4"
						stroke="currentColor"
						strokeWidth="1"
						strokeLinecap="round"
					/>
				</svg>
			</div>
		),
	},
];

export function CareersValues() {
	return (
		<div className="w-full">
			<div className="mb-12 max-w-3xl text-left sm:mb-16">
				<h2 className="font-semibold text-2xl text-text-sub-600 leading-[1.3] tracking-tight sm:text-3xl lg:text-[2.2rem] dark:text-white/60">
					<span className="font-semibold text-text-strong-950 dark:text-white">
						Our values.
					</span>{" "}
					To build for the next era of companies, we stand by our core
					principles in everything we do — from the features we ship to how we
					show up every day.
				</h2>
			</div>

			<div className="grid grid-cols-1 border border-stroke-soft-200 md:grid-cols-2 dark:border-white/10">
				{values.map((item, index) => {
					const isTopRow = index < 2;
					const isLeftColumn = index % 2 === 0;

					return (
						<div
							key={item.title}
							className={`flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8 lg:p-10 ${
								isTopRow ? "border-stroke-soft-200 border-b dark:border-white/10" : ""
							} ${
								isLeftColumn
									? "md:border-stroke-soft-200 md:border-r dark:md:border-white/10"
									: ""
							} ${
								!isTopRow && index === 2
									? "border-stroke-soft-200 border-b md:border-b-0 dark:border-white/10"
									: ""
							}`}
						>
							{item.renderDiagram(`val-${index}`)}
							<div className="flex-1">
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-base dark:text-white">
									{item.title}
								</h3>
								<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed sm:text-[13.5px] dark:text-white/55">
									{item.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
