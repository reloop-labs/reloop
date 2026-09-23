type BimiLetter = {
	letter: string;
	word: string;
	description: string;
	hex: string;
};

const LETTERS: BimiLetter[] = [
	{
		letter: "B",
		word: "Brand",
		description:
			"Your registered logo or trademark — the mark mailbox providers display beside your mail.",
		hex: "#2563eb",
	},
	{
		letter: "I",
		word: "Indicators",
		description:
			"A DNS signal at default._bimi that tells inboxes a verified logo is available.",
		hex: "#10b981",
	},
	{
		letter: "M",
		word: "Message",
		description:
			"The logo shows next to the messages you send, right in the inbox list.",
		hex: "#f59e0b",
	},
	{
		letter: "I",
		word: "Identification",
		description:
			"It only appears after SPF, DKIM, and DMARC prove the message is really from you.",
		hex: "#f43f5e",
	},
];

export function WhatIsBimi() {
	return (
		<section
			id="what-is-bimi"
			aria-labelledby="what-is-bimi-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					What is BIMI
				</p>
				<h2
					id="what-is-bimi-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					BIMI, letter by letter
				</h2>
				<p className="max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					Brand Indicators for Message Identification — an open standard that
					puts your verified logo in the inbox.
				</p>
			</div>

			<div className="border-stroke-soft-100 border-b px-4 py-10 sm:px-8 sm:py-12 lg:px-12 dark:border-white/10">
				{/* Giant word */}
				<div className="grid grid-cols-4">
					{LETTERS.map((item) => (
						<div
							key={item.word}
							className="relative flex items-center justify-center"
						>
							<div
								aria-hidden
								className="absolute size-24 rounded-full blur-2xl sm:size-32"
								style={{ backgroundColor: item.hex, opacity: 0.16 }}
							/>
							<span
								className="relative font-semibold text-[3.5rem] leading-none tracking-tight sm:text-7xl lg:text-8xl"
								style={{ color: item.hex }}
							>
								{item.letter}
							</span>
						</div>
					))}
				</div>

				{/* Connector lines (desktop) */}
				<div className="mt-4 hidden grid-cols-4 md:grid">
					{LETTERS.map((item) => (
						<div key={item.word} className="flex flex-col items-center">
							<span
								aria-hidden
								className="size-1.5 rounded-full"
								style={{ backgroundColor: item.hex }}
							/>
							<span
								aria-hidden
								className="mt-1 h-12 w-px"
								style={{
									background: `linear-gradient(to bottom, ${item.hex}, transparent)`,
								}}
							/>
						</div>
					))}
				</div>

				{/* Explanations (desktop) */}
				<div className="mt-2 hidden grid-cols-4 divide-x divide-stroke-soft-100 md:grid dark:divide-white/10">
					{LETTERS.map((item) => (
						<div key={item.word} className="px-4 text-center lg:px-6">
							<div className="flex items-center justify-center gap-2">
								<span
									className="h-3.5 w-[2px] shrink-0 rounded-full"
									style={{ backgroundColor: item.hex }}
									aria-hidden="true"
								/>
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									{item.word}
								</h3>
							</div>
							<p className="mt-3 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
								{item.description}
							</p>
						</div>
					))}
				</div>

				{/* Explanations (mobile) */}
				<div className="mt-10 grid grid-cols-1 gap-7 md:hidden">
					{LETTERS.map((item) => (
						<div key={item.word} className="flex items-start gap-4">
							<span
								aria-hidden
								className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-200 bg-neutral-100 font-semibold text-xl dark:border-white/10 dark:bg-white/[0.05]"
								style={{ color: item.hex }}
							>
								{item.letter}
							</span>
							<div>
								<div className="flex items-center gap-2">
									<span
										className="h-3.5 w-[2px] shrink-0 rounded-full"
										style={{ backgroundColor: item.hex }}
										aria-hidden="true"
									/>
									<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
										{item.word}
									</h3>
								</div>
								<p className="mt-2 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
									{item.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
