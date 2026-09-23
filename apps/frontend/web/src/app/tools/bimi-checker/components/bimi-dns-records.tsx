"use client";

import { useLayoutEffect, useRef, useState } from "react";

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
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const scrollerRef = useRef<HTMLDivElement | null>(null);
	const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
	const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const [paths, setPaths] = useState<string[]>([]);
	const [box, setBox] = useState({ w: 0, h: 0 });
	const selector = PARTS[0];
	const values = PARTS.slice(1);

	useLayoutEffect(() => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const compute = () => {
			const wr = wrap.getBoundingClientRect();
			const d: string[] = [];
			for (let i = 0; i < PARTS.length; i++) {
				const p = pillRefs.current[i]?.getBoundingClientRect();
				const t = dotRefs.current[i]?.getBoundingClientRect();
				if (!p || !t) continue;
				const px = p.left + p.width / 2 - wr.left;
				const py = p.bottom - wr.top;
				const dx = t.left + t.width / 2 - wr.left;
				const dy = t.top - wr.top;
				if (dy - py < 8) {
					d.push("");
					continue;
				}
				// Z elbow: down from pill, across, down into the dot.
				// Horizontal run length follows the pill-to-card distance.
				const my = py + Math.max(14, (dy - py) * 0.45);
				d.push(
					`M ${px.toFixed(1)} ${py.toFixed(1)} V ${my.toFixed(1)} H ${dx.toFixed(1)} V ${dy.toFixed(1)}`,
				);
			}
			setPaths(d);
			setBox({ w: wr.width, h: wr.height });
		};
		compute();
		const ro = new ResizeObserver(compute);
		ro.observe(wrap);
		const scroller = scrollerRef.current;
		scroller?.addEventListener("scroll", compute, { passive: true });
		window.addEventListener("resize", compute);
		const t = setTimeout(compute, 300);
		return () => {
			ro.disconnect();
			scroller?.removeEventListener("scroll", compute);
			window.removeEventListener("resize", compute);
			clearTimeout(t);
		};
	}, []);

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
					One TXT record: type first, then four values. Each value points to
					its box.
				</p>
			</div>

			<div
				ref={wrapRef}
				className="relative border-stroke-soft-100 border-b px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10"
			>
				{/* Full record as two joined groups: Record Type + Value */}
				<div className="mt-4 flex justify-center">
					<div
						ref={scrollerRef}
						className="flex max-w-full overflow-x-auto pb-1"
					>
						<div className="m-auto flex w-max items-start gap-4 sm:gap-6">
							<div className="flex flex-col">
								<p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-stone-500 dark:text-white/40">
									Record Type
								</p>
								<div className="mt-1.5 flex items-stretch">
									<div
										className="flex items-center justify-center whitespace-nowrap border-b-[2.5px] border-stone-400 bg-white p-1 text-center font-mono font-semibold text-[12.5px] text-stone-500 leading-relaxed dark:bg-white/[0.04] dark:text-white/60"
									>
										<span>TXT</span>
									</div>
									{selector ? (
										<div
											ref={(el) => {
												pillRefs.current[0] = el;
											}}
											className="-ml-px flex items-center justify-center whitespace-nowrap border-b-[2.5px] bg-white p-1 text-center font-mono text-[12.5px] leading-relaxed dark:bg-white/[0.04]"
											style={{
												borderBottomColor: selector.hex,
											}}
										>
											<span style={{ color: selector.hex }}>
												{selector.segment}
											</span>
										</div>
									) : null}
								</div>
							</div>
							<div className="flex flex-col">
								<p className="text-center font-mono text-[11px] uppercase tracking-[0.14em] text-stone-500 dark:text-white/40">
									Value
								</p>
								<div className="mt-1.5 flex items-stretch">
									{values.map((part, k) => (
										<div
											key={part.n}
											ref={(el) => {
												pillRefs.current[k + 1] = el;
											}}
											className={`flex items-center justify-center whitespace-nowrap border-b-[2.5px] bg-white p-1 text-center font-mono text-[12.5px] leading-relaxed dark:bg-white/[0.04] ${k === 0 ? "" : "-ml-px"}`}
											style={{
												borderBottomColor: part.hex,
											}}
										>
											<span style={{ color: part.hex }}>{part.segment}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Z-shaped wires: pill -> across -> card dot */}
				{box.w > 0 ? (
					<svg
						aria-hidden
						className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
						viewBox={`0 0 ${box.w} ${box.h}`}
						fill="none"
					>
						{paths.map((d, i) => {
							const part = PARTS[i];
							if (!d || !part) return null;
							return (
								<path
									key={part.n}
									d={d}
									stroke={part.hex}
									strokeWidth={1.5}
									strokeLinejoin="round"
									strokeLinecap="round"
									opacity={0.9}
								/>
							);
						})}
					</svg>
				) : null}

				{/* Explainer cards below, color-wired to each part */}
				<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
					{PARTS.map((part, i) => (
						<div key={part.n} className="flex flex-col items-center">
							{/* Connector dot (wire endpoint) */}
							<div aria-hidden className="flex flex-col items-center py-3">
								<span
									ref={(el) => {
										dotRefs.current[i] = el;
									}}
									className="size-2 rounded-full"
									style={{ backgroundColor: part.hex }}
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
