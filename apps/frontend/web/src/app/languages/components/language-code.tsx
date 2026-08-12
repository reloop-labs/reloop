"use client";

import { useState } from "react";
import type { LanguageDefinition } from "../languages";

const EXT_BY_SLUG: Record<string, string> = {
	python: "py",
	go: "go",
	rust: "rs",
	ruby: "rb",
	elixir: "ex",
	java: "java",
	dotnet: "cs",
	php: "php",
	nodejs: "ts",
};

export default function LanguageCode({
	language,
}: {
	language: LanguageDefinition;
}) {
	const [copiedInstall, setCopiedInstall] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);

	const handleCopyInstall = async () => {
		await navigator.clipboard.writeText(language.installCommand);
		setCopiedInstall(true);
		setTimeout(() => setCopiedInstall(false), 2000);
	};

	const handleCopyCode = async () => {
		await navigator.clipboard.writeText(language.sendCode);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	const ext = EXT_BY_SLUG[language.slug] ?? "ts";

	return (
		<section
			id="code"
			className="relative w-full scroll-mt-16 border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Section header */}
				<div className="border-stroke-soft-200 border-b px-6 py-12 sm:px-10 sm:py-14 lg:px-12 dark:border-white/10">
					<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45">
						Code example
					</p>
					<h2 className="mt-2 font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Send your first email in {language.name}
					</h2>
					<p className="mt-1.5 max-w-2xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Install the official package, initialize the client with your API
						key, and call{" "}
						<code className="font-mono text-[13px] text-text-strong-950 dark:text-white">
							emails.send
						</code>
						.
					</p>
				</div>

				{/* Two-column layout */}
				<div className="grid grid-cols-1 md:grid-cols-12">
					{/* Install + features */}
					<div className="flex flex-col gap-0 border-stroke-soft-200 md:col-span-4 md:border-r dark:border-white/10">
						<div className="border-stroke-soft-200 border-b p-6 sm:p-8 dark:border-white/10">
							<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
								Install
							</span>
							<div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
								<code className="truncate font-mono text-[12px] text-text-strong-950 dark:text-white">
									{language.installCommand}
								</code>
								<button
									type="button"
									onClick={handleCopyInstall}
									className="shrink-0 font-medium text-text-strong-950 text-xs underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
								>
									{copiedInstall ? "Copied" : "Copy"}
								</button>
							</div>
						</div>

						<div className="p-6 sm:p-8">
							<span className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
								Included
							</span>
							<ul className="mt-3 flex flex-col gap-2.5">
								{[
									"Type coverage & auto-completion",
									"Environment variable key resolution",
									"Automatic retry with exponential backoff",
								].map((item) => (
									<li
										key={item}
										className="flex items-start gap-2.5 text-[13px] text-text-sub-600 dark:text-white/60"
									>
										<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-text-strong-950 dark:bg-white" />
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Code panel */}
					<div className="relative overflow-hidden border-stroke-soft-200 border-t bg-[#0d1117] text-white md:col-span-8 md:border-t-0 dark:border-white/10">
						<div className="flex items-center justify-between border-[#21262d] border-b bg-[#161b22] px-4 py-3">
							<div className="flex items-center gap-2">
								<span className="size-2.5 rounded-full bg-[#ff5f56]" />
								<span className="size-2.5 rounded-full bg-[#ffbd2e]" />
								<span className="size-2.5 rounded-full bg-[#27c93f]" />
								<span className="ml-2 font-mono text-white/50 text-xs">
									send_email.{ext}
								</span>
							</div>
							<button
								type="button"
								onClick={handleCopyCode}
								className="font-mono text-white/60 text-xs transition-colors hover:text-white"
							>
								{copiedCode ? "Copied" : "Copy code"}
							</button>
						</div>
						<div className="overflow-x-auto p-5 font-mono text-[13px] text-slate-200 leading-relaxed sm:p-6">
							<pre className="whitespace-pre">
								<code>{language.sendCode}</code>
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
