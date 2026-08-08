"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useMemo, useState } from "react";

export type GlossaryBrowserTerm = {
	slug: string;
	title: string;
	description: string;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function letterOf(title: string): string {
	const ch = title.trim().charAt(0).toUpperCase();
	return /[A-Z]/.test(ch) ? ch : "#";
}

function groupByLetter(
	terms: GlossaryBrowserTerm[],
): { letter: string; terms: GlossaryBrowserTerm[] }[] {
	const map = new Map<string, GlossaryBrowserTerm[]>();

	for (const term of terms) {
		const letter = letterOf(term.title);
		const list = map.get(letter) ?? [];
		list.push(term);
		map.set(letter, list);
	}

	const letters = [...map.keys()].sort((a, b) => {
		if (a === "#") return -1;
		if (b === "#") return 1;
		return a.localeCompare(b);
	});

	return letters.map((letter) => ({
		letter,
		terms: (map.get(letter) ?? []).sort((a, b) =>
			a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
		),
	}));
}

function TermCard({ term }: { term: GlossaryBrowserTerm }) {
	return (
		<Link
			href={`/glossary/${term.slug}`}
			title={`${term.title} definition  -  email glossary`}
			className="group flex items-start gap-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-4 transition-colors duration-200 hover:bg-bg-weak-50 sm:gap-5 sm:px-5 sm:py-5 dark:border-white/10 dark:bg-[#111] dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
		>
			<div className="min-w-0 flex-1">
				<h3 className="font-semibold text-[15px] text-text-strong-950 leading-snug sm:text-[16px] dark:text-white">
					{term.title}
				</h3>
				<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/55">
					{term.description}
				</p>
			</div>
			<span
				aria-hidden
				className="mt-1.5 hidden shrink-0 text-text-sub-600 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 sm:inline dark:text-white/40"
			>
				→
			</span>
		</Link>
	);
}

export function GlossaryBrowser({
	terms,
}: {
	terms: GlossaryBrowserTerm[];
	railClassName?: string;
}) {
	const [query, setQuery] = useState("");

	const availableLetters = useMemo(() => {
		const set = new Set(terms.map((t) => letterOf(t.title)));
		return set;
	}, [terms]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return terms;
		return terms.filter(
			(term) =>
				term.title.toLowerCase().includes(q) ||
				term.description.toLowerCase().includes(q) ||
				term.slug.toLowerCase().includes(q),
		);
	}, [terms, query]);

	const groups = useMemo(() => groupByLetter(filtered), [filtered]);
	const isSearching = query.trim().length > 0;

	return (
		<>
			{/* Search  -  rails max-w-7xl; field max-w-md */}
			<div
				className={
					"mx-auto w-full max-w-7xl border-stroke-soft-200 border-x dark:border-white/10"
				}
			>
				<div className="mx-auto w-full max-w-md px-4 pb-8 sm:px-6">
					<label htmlFor="glossary-search" className="sr-only">
						Search terms
					</label>
					<div className="relative">
						<Icon
							name="search"
							className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 size-3.5 text-text-sub-600 dark:text-white/40"
							aria-hidden
						/>
						<input
							id="glossary-search"
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search terms"
							autoComplete="off"
							className="h-11 w-full rounded-full border border-stroke-soft-200 bg-bg-weak-50 pr-4 pl-10 text-[14px] text-text-strong-950 outline-none transition-colors placeholder:text-text-sub-600 focus:border-text-strong-950 focus:bg-bg-white-0 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-white/30 dark:focus:bg-white/[0.06] dark:placeholder:text-white/40"
						/>
					</div>
				</div>
			</div>

			{/* A–Z  -  rails max-w-7xl; top/bottom borders span rail width; sticky */}
			<nav
				aria-label="Jump to letter"
				className={cn(
					"sticky top-16 z-40 border-stroke-soft-200 border-y bg-bg-white-0 dark:border-white/10 dark:bg-black",
				)}
			>
				<div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-x-1 gap-y-1 border-stroke-soft-200 border-x px-4 py-3 sm:gap-x-1.5 sm:px-6 dark:border-white/10">
					{(["#", ...ALPHABET] as const).map((letter) => {
						const hasTerms = availableLetters.has(letter);
						const letterId =
							letter === "#"
								? "letter-other"
								: `letter-${letter.toLowerCase()}`;

						if (!hasTerms || isSearching) {
							return (
								<span
									key={letter}
									className={cn(
										"inline-flex size-7 items-center justify-center font-medium text-[12px] sm:size-8 sm:text-[13px]",
										hasTerms && isSearching
											? "text-text-sub-600/50 dark:text-white/25"
											: "text-text-sub-600/30 dark:text-white/15",
									)}
									aria-disabled="true"
								>
									{letter}
								</span>
							);
						}

						return (
							<a
								key={letter}
								href={`#${letterId}`}
								className="inline-flex size-7 items-center justify-center rounded-md font-medium text-[12px] text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 sm:size-8 sm:text-[13px] dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white"
							>
								{letter}
							</a>
						);
					})}
				</div>
			</nav>

			{/* Results  -  rails max-w-7xl; list max-w-4xl */}
			<div className="mx-auto w-full max-w-7xl border-stroke-soft-200 border-x bg-bg-weak-50/80 dark:border-white/10 dark:bg-white/[0.02]">
				{groups.length === 0 ? (
					<p className="mx-auto max-w-4xl px-4 py-16 text-center text-[15px] text-text-sub-600 sm:px-6 dark:text-white/50">
						Nothing matched &ldquo;{query.trim()}&rdquo;.
					</p>
				) : (
					<div className="mx-auto w-full max-w-4xl space-y-14 px-4 py-10 sm:space-y-16 sm:px-6 sm:py-12 lg:px-8">
						{groups.map(({ letter, terms: letterTerms }) => {
							const letterId =
								letter === "#"
									? "letter-other"
									: `letter-${letter.toLowerCase()}`;

							return (
								<section
									key={letter}
									id={letterId}
									className="scroll-mt-40"
									aria-labelledby={`${letterId}-heading`}
								>
									<div className="flex items-stretch gap-4 sm:gap-8 lg:gap-10">
										<div className="w-10 shrink-0 sm:w-14 lg:w-16">
											<h2
												id={`${letterId}-heading`}
												aria-label={`Terms starting with ${letter}`}
												className={cn(
													"sticky top-32 z-10 select-none pt-1 font-light font-sans text-[3.25rem] leading-none tracking-tight sm:top-36 sm:pt-2 sm:text-[4rem] lg:text-[4.5rem]",
													"text-transparent",
													"[-webkit-text-stroke:1.25px_#a3a3a3]",
													"dark:[-webkit-text-stroke:1.25px_rgba(255,255,255,0.35)]",
												)}
											>
												{letter}
											</h2>
										</div>
										<ul className="min-w-0 flex-1 space-y-3 pt-1 sm:pt-2">
											{letterTerms.map((term) => (
												<li key={term.slug}>
													<TermCard term={term} />
												</li>
											))}
										</ul>
									</div>
								</section>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}
