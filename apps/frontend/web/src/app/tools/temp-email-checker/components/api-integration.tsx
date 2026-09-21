"use client";

import { cn } from "@reloop/ui/cn";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiBodyArgs, apiEndpoint, apiSnippets } from "../content";
import {
	AnimatedCopyIcon,
	RequestCard,
	ResponseCard,
} from "./api-request-response";

export function ApiIntegration() {
	const [activeId, setActiveId] = useState<string>(
		apiSnippets.find((s) => s.id === "node")?.id ?? apiSnippets[0].id,
	);
	const [copiedEndpoint, setCopiedEndpoint] = useState(false);
	const pathScrollRef = useRef<HTMLDivElement | null>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updatePathFade = useCallback(() => {
		const el = pathScrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 4);
		setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
	}, []);

	useEffect(() => {
		updatePathFade();
		window.addEventListener("resize", updatePathFade);
		return () => window.removeEventListener("resize", updatePathFade);
	}, [updatePathFade]);

	const handleCopyEndpoint = async () => {
		try {
			await navigator.clipboard.writeText(apiEndpoint);
			setCopiedEndpoint(true);
			setTimeout(() => setCopiedEndpoint(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};

	return (
		<section id="api" aria-labelledby="api-heading" className="w-full">
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] text-primary-base uppercase">
					Use it in code
				</p>
				<h2
					id="api-heading"
					className="text-balance font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white"
				>
					Integrate this into the code today.
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8">
				{/* Left: endpoint + Body docs */}
				<div className="flex min-w-0 flex-col gap-5 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
					<div className="api-endpoint-bar flex items-center rounded-[18px] border border-stroke-soft-100 bg-[#fafafa] p-0.5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0e]">
						<button
							type="button"
							onClick={handleCopyEndpoint}
							aria-label={
								copiedEndpoint ? "Endpoint URL copied" : "Copy endpoint URL"
							}
							title={copiedEndpoint ? "Copied" : "Copy endpoint URL"}
							className="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-[16px] border border-stroke-soft-100/70 bg-white px-3 py-2.5 text-left transition-colors hover:border-stroke-soft-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9eff] dark:border-stroke-soft-100/15 dark:bg-zinc-950 dark:hover:border-stroke-soft-100/30"
						>
							<span className="shrink-0 rounded-[10px] bg-blue-600 px-2 py-0.5 font-bold text-[11px] text-white uppercase tracking-wider dark:bg-blue-600 dark:text-white">
								POST
							</span>
							<div className="relative min-w-0 flex-1">
								<div
									aria-hidden
									className={cn(
										"pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent transition-opacity dark:from-zinc-950",
										canScrollLeft ? "opacity-100" : "opacity-0",
									)}
								/>
								<div
									ref={pathScrollRef}
									onScroll={updatePathFade}
									className="min-w-0 overflow-x-auto whitespace-nowrap font-medium text-[13px] text-text-strong-950 [-ms-overflow-style:none] [scrollbar-width:none] dark:text-white [&::-webkit-scrollbar]:hidden"
								>
									{apiEndpoint}
								</div>
								<div
									aria-hidden
									className={cn(
										"pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent transition-opacity dark:from-zinc-950",
										canScrollRight ? "opacity-100" : "opacity-0",
									)}
								/>
							</div>
							<span
								aria-hidden
								className="shrink-0 text-text-sub-600 dark:text-white/55"
							>
								<AnimatedCopyIcon
									copied={copiedEndpoint}
									className="size-4 stroke-[3px]"
								/>
							</span>
						</button>
					</div>

					<div>
						<h3 className="font-semibold text-[18px] text-text-strong-950 tracking-tight dark:text-white">
							Body
						</h3>
						<div
							aria-hidden
							className="mt-3 border-stroke-soft-100 border-t dark:border-white/10"
						/>
						<dl className="mt-5 space-y-7">
							{apiBodyArgs.map((arg) => (
								<div key={arg.name}>
									<dt className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
										<code className="font-medium font-mono text-text-strong-950 dark:text-white">
											{arg.name}
										</code>
										<span className="rounded-[7px] bg-black/[0.05] px-2 py-0.5 font-medium font-mono text-[12px] text-text-sub-600 dark:bg-white/10 dark:text-white/60">
											{arg.type}
										</span>
										{arg.required ? (
											<span className="font-medium text-[12px] text-red-600 dark:text-red-400">
												required
											</span>
										) : null}
									</dt>
									<dd className="mt-2 max-w-xl text-[14px] text-text-sub-600 leading-relaxed dark:text-white/60">
										{arg.description}
									</dd>
								</div>
							))}
						</dl>
					</div>
				</div>

				{/* Right: request + response */}
				<div className="flex min-w-0 flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8 lg:px-8 lg:py-10 xl:px-12">
					<RequestCard
						snippets={apiSnippets}
						activeId={activeId}
						onChange={setActiveId}
					/>
					<ResponseCard />
				</div>
			</div>
		</section>
	);
}
