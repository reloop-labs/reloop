"use client";

import { cn } from "@reloop/ui/cn";
import { CopyCodeBlock } from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "@reloop/web/app/sdk/components/language-icon";
import { getLanguageIcon } from "@reloop/web/components/mdx/language-icons";
import { useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { apiEndpoint, apiNotes, apiResponseSample, apiSnippets } from "../content";

const SNIPPET_LANG: Record<string, string> = {
	curl: "bash",
	node: "typescript",
	python: "python",
	go: "go",
};

export function ApiIntegration() {
	const [activeId, setActiveId] = useState<string>(apiSnippets[0].id);
	const active = apiSnippets.find((s) => s.id === activeId) ?? apiSnippets[0];
	const lang = SNIPPET_LANG[active.id] ?? "bash";

	return (
		<section
			id="api"
			aria-labelledby="api-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] uppercase">
					<span className="text-primary-base">03.</span>{" "}
					<span className="text-text-sub-600 dark:text-white/50">
						Use it in code
					</span>
				</p>
				<h2
					id="api-heading"
					className="text-balance font-semibold text-2xl text-text-strong-950 tracking-[-0.025em] sm:text-3xl lg:text-[2rem] lg:leading-[1.15] dark:text-white"
				>
					Block throwaways <span className="text-primary-base">at signup</span>,
					not in a spreadsheet
				</h2>
				<p className="mt-4 max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					One public POST — no key, no account. Copy a snippet, paste it
					into your signup flow, and share the result link with your team.
				</p>
			</div>

			<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10">
				{/* Left: endpoint + notes */}
				<div className="flex flex-col gap-5 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
					<div className="flex items-center gap-2 font-mono text-[12px]">
						<span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
							POST
						</span>
						<code className="truncate text-text-strong-950 dark:text-white">
							{apiEndpoint}
						</code>
					</div>

					<div className="flex flex-wrap gap-1.5">
						{apiSnippets.map((snippet) => {
							const snippetLang = SNIPPET_LANG[snippet.id] ?? "bash";
							const si = getLanguageIcon(
								snippetLang,
							) as unknown as SimpleIcon | undefined;
							const brandColor = si ? `#${si.hex}` : undefined;
							const isActive = snippet.id === activeId;
							const isDark = si ? isDarkBrandColor(si.hex) : true;
							return (
								<button
									key={snippet.id}
									type="button"
									onClick={() => setActiveId(snippet.id)}
									aria-pressed={isActive}
									className={cn(
										"inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 font-medium text-[13px] transition-colors duration-150",
										isActive
											? "text-white"
											: "border border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-white/10 dark:text-white/60 dark:hover:text-white",
									)}
									style={
										isActive && brandColor
											? { backgroundColor: brandColor }
											: undefined
									}
								>
									{si ? (
										<span
											className={cn(
												"inline-flex items-center",
												!isActive &&
													isDark &&
													"text-text-strong-950 dark:text-white",
											)}
											style={
												isActive
													? { color: "#ffffff" }
													: getBrandColorStyle(si.hex)
											}
										>
											<LanguageIcon icon={si} className="size-3.5" />
										</span>
									) : null}
									{snippet.label}
								</button>
							);
						})}
					</div>

					<ul className="space-y-3">
						{apiNotes.map((note) => (
							<li key={note.title} className="flex items-start gap-2.5">
								<Icon
									name={note.icon}
									className="mt-0.5 size-4 shrink-0 text-primary-base"
								/>
								<div>
									<p className="font-semibold text-[13.5px] text-text-strong-950 dark:text-white">
										{note.title}
									</p>
									<p className="mt-0.5 text-[13px] text-stone-500 leading-relaxed dark:text-white/60">
										{note.description}
									</p>
								</div>
							</li>
						))}
					</ul>

				</div>

				{/* Right: request + response */}
				<div className="flex flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
					<CopyCodeBlock
						code={active.code}
						lang={lang}
						title={active.label}
						si={getLanguageIcon(lang)}
					/>
					<CopyCodeBlock
						code={apiResponseSample}
						lang="json"
						title="verdict.json"
						si={getLanguageIcon("json")}
					/>
				</div>
			</div>
		</section>
	);
}
