const PARTS: {
	n: string;
	label: string;
	value: string;
	segment: string;
	text: string;
	hex: string;
}[] = [
	{
		n: "1",
		label: "SELECTOR",
		value: "default._bimi",
		segment: "default._bimi.example.com",
		text: "Hostname the assertion lives at, plus TXT type. No record here means no logo, even if everything else is ready.",
		hex: "#2563eb",
	},
	{
		n: "2",
		label: "VERSION",
		value: "v=BIMI1;",
		segment: "v=BIMI1;",
		text: "Must come first and match exactly. A missing or wrong version fails the whole record.",
		hex: "#16a34a",
	},
	{
		n: "3",
		label: "LOGO",
		value: "l=….svg;",
		segment: "l=https://example.com/logo.svg;",
		text: "HTTPS URL to an SVG Tiny PS logo. Square canvas, no scripts, no animation, no remote refs.",
		hex: "#ea580c",
	},
	{
		n: "4",
		label: "CERTIFICATE",
		value: "a=….pem",
		segment: "a=https://example.com/vmc.pem",
		text: "HTTPS URL to your VMC or CMC. Gmail generally requires it; other inboxes treat a missing a= as a warning.",
		hex: "#7c3aed",
	},
];

export function BimiDnsRecords() {
	return (
		<section
			id="dns-records"
			aria-labelledby="dns-records-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					DNS records
				</p>
				<h2
					id="dns-records-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					What the DNS looks like
				</h2>
				<p className="max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					One TXT record, four parts. Each part points to its box.
				</p>
			</div>

			<div className="border-stroke-soft-100 border-b px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10">
				<p className="text-center font-mono text-[12px] text-stone-500 tracking-wider sm:text-[12.5px] dark:text-white/40">
					TXT at default._bimi.{`{domain}`}
				</p>

				{/* 4 columns: segment box -> connector -> explainer card, aligned */}
				<div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
					{PARTS.map((part) => (
						<div key={part.n} className="flex flex-col items-center">
							{/* Top: square segment box */}
							<div className="flex w-fit max-w-full items-center justify-center rounded-xl border border-stroke-soft-200 bg-neutral-100 p-1 text-center font-mono text-[12.5px] leading-relaxed break-all dark:border-white/10 dark:bg-white/[0.04]">
								<span style={{ color: part.hex }}>{part.segment}</span>
							</div>
							{/* Connector pointing down to the card */}
							<div aria-hidden className="flex flex-col items-center py-3">
								<span
									className="size-2 rounded-full"
									style={{ backgroundColor: part.hex }}
								/>
								<span
									className="h-10 w-px"
									style={{
										background: `linear-gradient(to bottom, ${part.hex}, transparent)`,
									}}
								/>
							</div>
							{/* Bottom: explainer card */}
							<div className="flex w-full flex-1 flex-col overflow-hidden rounded-xl border border-stroke-soft-200 dark:border-white/10">
								<div
									className="px-4 py-3 text-white"
									style={{ backgroundColor: part.hex }}
								>
									<p className="font-semibold text-[13px] tracking-tight">
										{part.n}. {part.label}
									</p>
									<p className="mt-0.5 font-mono text-[11.5px] text-white/85">
										({part.value})
									</p>
								</div>
								<p className="flex-1 bg-white px-4 py-3.5 text-[13px] text-stone-500 leading-relaxed dark:bg-black dark:text-white/60">
									{part.text}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Prerequisite line */}
				<p className="mt-8 border-t border-stroke-soft-100 pt-5 text-center text-[13px] text-stone-500 leading-relaxed dark:border-white/10 dark:text-white/60">
					<span className="font-mono text-[12.5px] text-text-strong-950 dark:text-white">
						_dmarc.example.com TXT “v=DMARC1; p=quarantine; pct=100;”
					</span>
					<br />
					DMARC must be at quarantine or reject — p=none never shows a logo.
				</p>
			</div>
		</section>
	);
}
