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

const apiPath = apiEndpoint.replace(/^https?:\/\/[^/]+/, "");

export function ApiIntegration() {
	const [activeId, setActiveId] = useState<string>(apiSnippets[0].id);
	const [copiedEndpoint, setCopiedEndpoint] = useState(false);
	const active = apiSnippets.find((s) => s.id === activeId) ?? apiSnippets[0];
	const lang = SNIPPET_LANG[active.id] ?? "bash";

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
					<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-bg-white-0 py-2 pr-2 pl-3 dark:border-white/10 dark:bg-white/[0.03]">
						<span className="shrink-0 rounded-md bg-blue-600 px-2 py-0.5 font-mono font-semibold text-[11px] text-white tracking-wide">
							POST
						</span>
						<code className="min-w-0 flex-1 truncate font-mono text-[13px] text-text-strong-950 dark:text-white">
							{apiPath}
						</code>
						<button
							type="button"
							onClick={handleCopyEndpoint}
							aria-label={copiedEndpoint ? "Copied" : "Copy endpoint"}
							className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
						>
							<Icon
								name={copiedEndpoint ? "check" : "copy"}
								className="size-4"
							/>
						</button>
					</div>

					<div
						role="tablist"
						aria-label="Code language"
						className="flex items-center gap-1 overflow-x-auto"
					>
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
									role="tab"
									aria-selected={isActive}
									onClick={() => setActiveId(snippet.id)}
									className={cn(
										"relative shrink-0 cursor-pointer rounded-lg px-3 py-2 font-medium text-[13px] transition-colors duration-150",
										isActive
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
									)}
									style={
										isActive && brandColor
											? {
													backgroundColor: `color-mix(in srgb, ${brandColor} 12%, transparent)`,
												}
											: undefined
									}
								>
									<span className="inline-flex items-center gap-2">
										{si ? (
											<span
												className={cn(
													"inline-flex items-center",
													isDark &&
														"text-text-strong-950 dark:text-white",
												)}
												style={getBrandColorStyle(si.hex)}
											>
												<LanguageIcon icon={si} className="size-4" />
											</span>
										) : null}
										{snippet.label}
									</span>
									{isActive && brandColor ? (
										<span
											aria-hidden
											className="absolute inset-x-3 -bottom-px h-[2px] rounded-full"
											style={{ backgroundColor: brandColor }}
										/>
									) : null}
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
