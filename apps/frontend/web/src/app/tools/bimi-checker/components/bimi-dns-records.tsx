"use client";

import { cn } from "@reloop/ui/cn";
import { useLayoutEffect, useRef, useState } from "react";
import { SectionHeading } from "../../components/section-heading";

type Part = {
	n: string;
	label: string;
	value: string;
	segment: string;
	requirement: string;
	text: string;
	hex: string;
};

const PARTS: Part[] = [
	{
		n: "1",
		label: "Selector",
		value: "default._bimi",
		segment: "default._bimi.yourdomain.com",
		requirement: "Required",
		text: "Where the record lives. No TXT record at this name means no logo, even if everything else is ready.",
		hex: "#2563eb",
	},
	{
		n: "2",
		label: "Version",
		value: "v=BIMI1;",
		segment: "v=BIMI1;",
		requirement: "Required",
		text: "Must come first and match exactly. A missing or wrong version fails the whole record.",
		hex: "#16a34a",
	},
	{
		n: "3",
		label: "Logo",
		value: "l=….svg;",
		segment: "l=https://example.com/logo.svg;",
		requirement: "Required",
		text: "HTTPS link to your SVG logo. Square, with no scripts, animation, or remote images.",
		hex: "#ea580c",
	},
	{
		n: "4",
		label: "Certificate",
		value: "a=….pem",
		segment: "a=https://example.com/vmc.pem",
		requirement: "Needed for Gmail",
		text: "HTTPS link to your VMC or CMC. Gmail and Apple Mail need it; other inboxes show the logo without one.",
		hex: "#7c3aed",
	},
];

const CORNER = 8;

/** Down from the segment, across, down into the card, with rounded corners. */
function wirePath(px: number, py: number, dx: number, dy: number): string {
	const my = py + Math.max(16, (dy - py) * 0.5);
	const run = dx - px;
	if (Math.abs(run) < CORNER * 2) {
		return `M ${px} ${py} V ${my} H ${dx} V ${dy}`;
	}
	const dir = Math.sign(run);
	return [
		`M ${px} ${py}`,
		`V ${my - CORNER}`,
		`Q ${px} ${my} ${px + dir * CORNER} ${my}`,
		`H ${dx - dir * CORNER}`,
		`Q ${dx} ${my} ${dx} ${my + CORNER}`,
		`V ${dy}`,
	].join(" ");
}

export function BimiDnsRecords() {
	const wrapRef = useRef<HTMLDivElement | null>(null);
	const scrollerRef = useRef<HTMLDivElement | null>(null);
	const segmentRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const [paths, setPaths] = useState<string[]>([]);
	const [box, setBox] = useState({ w: 0, h: 0 });
	const [active, setActive] = useState<string | null>(null);
	const [selector, ...values] = PARTS as [Part, ...Part[]];

	useLayoutEffect(() => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const compute = () => {
			const wr = wrap.getBoundingClientRect();
			const d: string[] = [];
			for (let i = 0; i < PARTS.length; i++) {
				const p = segmentRefs.current[i]?.getBoundingClientRect();
				const t = dotRefs.current[i]?.getBoundingClientRect();
				if (!p || !t) {
					d.push("");
					continue;
				}
				const px = p.left + p.width / 2 - wr.left;
				const py = p.bottom - wr.top;
				const dx = t.left + t.width / 2 - wr.left;
				const dy = t.top - wr.top;
				d.push(dy - py < 8 ? "" : wirePath(px, py, dx, dy));
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

	const segment = (part: Part, index: number) => (
		<span
			key={part.n}
			ref={(el) => {
				segmentRefs.current[index] = el;
			}}
			className={cn(
				"whitespace-nowrap rounded-md px-1.5 py-1 transition-opacity",
				active && active !== part.n && "opacity-35",
			)}
			style={{
				color: part.hex,
				backgroundColor: `${part.hex}${active === part.n ? "24" : "12"}`,
			}}
		>
			{part.segment}
		</span>
	);

	return (
		<section
			id="dns-records"
			aria-labelledby="dns-records-heading"
			className="w-full"
		>
			<SectionHeading
				id="dns-records-heading"
				eyebrow="DNS records"
				icon="globe"
				title={["What the BIMI", "DNS record looks like"]}
				description="One TXT record with four parts. Each color points to the box that explains it."
			/>

			<div
				ref={wrapRef}
				className="relative border-stroke-soft-100 border-b px-4 py-10 sm:px-6 sm:py-12 lg:px-8 dark:border-white/10"
			>
				{/* The record, each part tinted in its color */}
				<div className="flex justify-center">
					<div
						ref={scrollerRef}
						className="max-w-full overflow-x-auto rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-1.5 dark:border-white/10 dark:bg-[#0c0c0c]"
					>
						<div className="flex w-max items-stretch font-mono text-[12.5px]">
							<div className="flex flex-col justify-center gap-1 border-stroke-soft-100 border-r px-3 py-1.5 dark:border-white/10">
								<span className="text-[10px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
									Type
								</span>
								<span className="font-semibold text-text-strong-950 dark:text-white">
									TXT
								</span>
							</div>
							<div className="flex flex-col justify-center gap-1 border-stroke-soft-100 border-r px-2 py-1.5 dark:border-white/10">
								<span className="px-1.5 text-[10px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
									Name
								</span>
								{segment(selector, 0)}
							</div>
							<div className="flex flex-col justify-center gap-1 px-2 py-1.5">
								<span className="px-1.5 text-[10px] text-text-soft-400 uppercase tracking-[0.14em] dark:text-white/35">
									Value
								</span>
								<span className="flex items-center gap-1">
									{values.map((part, k) => segment(part, k + 1))}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Wires from each part to its card */}
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
									strokeWidth={1.25}
									strokeLinecap="round"
									className="transition-opacity"
									opacity={active ? (active === part.n ? 1 : 0.15) : 0.55}
								/>
							);
						})}
					</svg>
				) : null}

				{/* What each part does */}
				<div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{PARTS.map((part, i) => (
						<div
							key={part.n}
							onMouseEnter={() => setActive(part.n)}
							onMouseLeave={() => setActive(null)}
							className="relative flex flex-col"
						>
							<span
								aria-hidden
								ref={(el) => {
									dotRefs.current[i] = el;
								}}
								className="-top-[3px] -translate-x-1/2 absolute left-1/2 z-10 hidden size-1.5 rounded-full sm:block"
								style={{ backgroundColor: part.hex }}
							/>
							<div
								className={cn(
									"flex flex-1 flex-col rounded-xl border bg-bg-white-0 p-5 transition-colors dark:bg-[#0b0b0b]",
									active !== part.n &&
										"border-stroke-soft-100 dark:border-white/10",
								)}
								style={
									active === part.n
										? { borderColor: `${part.hex}66` }
										: undefined
								}
							>
								<div className="flex items-center justify-between gap-2">
									<span className="flex items-center gap-2">
										<span
											className="flex size-6 items-center justify-center rounded-md font-mono font-semibold text-[11.5px]"
											style={{
												color: part.hex,
												backgroundColor: `${part.hex}14`,
											}}
										>
											{part.n}
										</span>
										<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
											{part.label}
										</h3>
									</span>
									<span className="whitespace-nowrap rounded-full bg-bg-weak-50 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 dark:bg-white/[0.06] dark:text-white/60">
										{part.requirement}
									</span>
								</div>
								<code
									className="mt-3 font-mono text-[12px]"
									style={{ color: part.hex }}
								>
									{part.value}
								</code>
								<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
									{part.text}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Prerequisite */}
				<div className="mt-4 flex flex-col gap-3 rounded-xl border border-stroke-soft-100 border-dashed px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
					<div>
						<p className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
							Also required: DMARC at enforcement
						</p>
						<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
							DMARC must be at quarantine or reject. With p=none, no inbox shows
							your logo.
						</p>
					</div>
					<code className="shrink-0 break-all rounded-lg bg-bg-weak-50 px-3 py-2 font-mono text-[12px] text-text-strong-950 dark:bg-white/[0.04] dark:text-white/85">
						_dmarc TXT "v=DMARC1; p=quarantine; pct=100;"
					</code>
				</div>
			</div>
		</section>
	);
}
