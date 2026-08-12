"use client";

import { useState } from "react";
import type { LanguageDefinition } from "../languages";

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

	const ext =
		language.slug === "python"
			? "py"
			: language.slug === "go"
				? "go"
				: language.slug === "rust"
					? "rs"
					: language.slug === "ruby"
						? "rb"
						: language.slug === "elixir"
							? "ex"
							: language.slug === "java"
								? "java"
								: language.slug === "dotnet"
									? "cs"
									: language.slug === "php"
										? "php"
										: "ts";

	return (
		<section id="code" className="scroll-mt-16 w-full border-t border-stroke-soft-200 bg-bg-weak-50/50 py-16 dark:border-white/10 dark:bg-white/[0.01]">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-2 text-center sm:text-left">
					<p className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/50">
						Implementation • Code Example
					</p>
					<h2 className="font-sans font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
						Send your first email in {language.name}
					</h2>
					<p className="max-w-2xl text-base text-text-sub-600 leading-relaxed dark:text-white/60">
						Install the official package, initialize the client with your API key, and call <code className="font-mono text-text-strong-950 dark:text-white">emails.send</code>.
					</p>
				</div>

				<div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-start">
					{/* Left Install Command & Spec */}
					<div className="flex flex-col gap-4 lg:col-span-4">
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 dark:border-white/10 dark:bg-bg-black-950">
							<span className="font-medium text-text-sub-600 text-xs dark:text-white/50">
								1-Click Installation
							</span>
							<div className="mt-2.5 flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-2.5 font-mono text-xs dark:border-white/10 dark:bg-white/5">
								<code className="truncate text-text-strong-950 dark:text-white">
									{language.installCommand}
								</code>
								<button
									type="button"
									onClick={handleCopyInstall}
									className="ml-2 font-sans font-medium text-xs text-primary-base hover:opacity-80"
								>
									{copiedInstall ? "Copied!" : "Copy"}
								</button>
							</div>
						</div>

						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 dark:border-white/10 dark:bg-bg-black-950">
							<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">
								Ecosystem Features
							</h4>
							<ul className="mt-3 flex flex-col gap-2 text-xs text-text-sub-600 dark:text-white/60">
								<li className="flex items-center gap-2">
									<span className="size-1.5 rounded-full bg-emerald-500" />
									<span>Type definition coverage &amp; auto-completion</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="size-1.5 rounded-full bg-emerald-500" />
									<span>Environment variable key resolution</span>
								</li>
								<li className="flex items-center gap-2">
									<span className="size-1.5 rounded-full bg-emerald-500" />
									<span>Automatic retry with exponential backoff</span>
								</li>
							</ul>
						</div>
					</div>

					{/* Right Code Sandbox */}
					<div className="relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0d1117] text-white shadow-sm lg:col-span-8 dark:border-white/10">
						<div className="flex items-center justify-between border-[#21262d] border-b bg-[#161b22] px-4 py-3">
							<div className="flex items-center gap-2">
								<span className="size-2.5 rounded-full bg-[#ff5f56]" />
								<span className="size-2.5 rounded-full bg-[#ffbd2e]" />
								<span className="size-2.5 rounded-full bg-[#27c93f]" />
								<span className="ml-2 font-mono text-xs text-white/50">
									send_email.{ext}
								</span>
							</div>
							<button
								type="button"
								onClick={handleCopyCode}
								className="font-mono text-xs text-white/60 transition-colors hover:text-white"
							>
								{copiedCode ? "Copied!" : "Copy code"}
							</button>
						</div>
						<div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-200">
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
