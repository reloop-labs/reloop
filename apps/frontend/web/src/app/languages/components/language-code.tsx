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
			className="relative w-full scroll-mt-20 border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Install strip */}
				<div className="flex flex-col gap-3 border-stroke-soft-200 border-b px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12 dark:border-white/10">
					<div className="min-w-0">
						<p className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
							Install
						</p>
						<code className="mt-1 block truncate font-mono text-[13px] text-text-strong-950 sm:text-sm dark:text-white">
							{language.installCommand}
						</code>
					</div>
					<button
						type="button"
						onClick={handleCopyInstall}
						className="inline-flex h-9 shrink-0 items-center justify-center self-start rounded-full border border-stroke-soft-200 bg-bg-weak-50 px-4 font-medium text-text-strong-950 text-xs transition-colors hover:bg-bg-soft-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] sm:self-auto"
					>
						{copiedInstall ? "Copied" : "Copy install"}
					</button>
				</div>

				{/* Code panel */}
				<div className="overflow-hidden bg-[#0d1117] text-white">
					<div className="flex items-center justify-between border-[#21262d] border-b bg-[#161b22] px-4 py-3 sm:px-5">
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
					<div className="overflow-x-auto p-5 font-mono text-[13px] text-slate-200 leading-relaxed sm:p-6 sm:text-[13.5px]">
						<pre className="whitespace-pre">
							<code>{language.sendCode}</code>
						</pre>
					</div>
				</div>
			</div>
		</section>
	);
}
