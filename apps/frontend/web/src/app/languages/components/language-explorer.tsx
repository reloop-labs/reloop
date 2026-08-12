"use client";

import Link from "next/link";
import { useState } from "react";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguageExplorer() {
	const [activeSlug, setActiveSlug] = useState<string>("nodejs");
	const [copiedInstall, setCopiedInstall] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);

	const activeLang =
		languages.find((l) => l.slug === activeSlug) ?? languages[0]!;

	const handleCopyInstall = () => {
		navigator.clipboard.writeText(activeLang.installCommand);
		setCopiedInstall(true);
		setTimeout(() => setCopiedInstall(false), 2000);
	};

	const handleCopyCode = () => {
		navigator.clipboard.writeText(activeLang.sendCode);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	return (
		<section id="sdk-explorer" className="w-full border-y border-stroke-soft-200 bg-bg-weak-50 py-16 dark:border-white/10 dark:bg-white/[0.01]">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-2">
					<p className="font-mono text-xs text-text-sub-600 uppercase tracking-wider dark:text-white/50">
						Interactive Playground • 0.1
					</p>
					<h2 className="font-sans font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
						Explore official SDKs in real time
					</h2>
					<p className="max-w-2xl text-base text-text-sub-600 leading-relaxed dark:text-white/60">
						Select your runtime below to view package installation syntax, framework integration details, and production code snippets.
					</p>
				</div>

				{/* Language Selector Tabs */}
				<div className="mt-8 flex flex-wrap gap-1.5 border-stroke-soft-200 border-b pb-4 dark:border-white/10">
					{languages.map((lang) => {
						const isActive = lang.slug === activeSlug;
						return (
							<button
								key={lang.slug}
								type="button"
								onClick={() => setActiveSlug(lang.slug)}
								className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-xs transition-colors ${
									isActive
										? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
										: "bg-transparent text-text-sub-600 hover:bg-bg-soft-50 hover:text-text-strong-950 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
								}`}
							>
								<span style={{ color: isActive ? "currentColor" : `#${lang.icon.hex}` }}>
									<LanguageIcon icon={lang.icon} className="size-3.5" />
								</span>
								<span>{lang.name}</span>
							</button>
						);
					})}
				</div>

				{/* Explorer Content Layout */}
				<div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
					{/* Left Metadata & Controls (5 cols) */}
					<div className="flex flex-col justify-between gap-6 lg:col-span-5">
						<div>
							<div className="flex items-center gap-3">
								<div
									className="inline-flex size-10 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10"
									style={{ color: `#${activeLang.icon.hex}` }}
								>
									<LanguageIcon icon={activeLang.icon} className="size-5" />
								</div>
								<div>
									<h3 className="font-semibold text-lg text-text-strong-950 dark:text-white">
										{activeLang.name} SDK
									</h3>
									<p className="font-mono text-xs text-text-sub-600 dark:text-white/40">
										{activeLang.packageName}
									</p>
								</div>
							</div>

							<p className="mt-4 text-sm text-text-sub-600 leading-relaxed dark:text-white/70">
								{activeLang.shortDescription}
							</p>

							{/* Key Specs Pill Matrix */}
							<div className="mt-6 flex flex-col gap-2.5">
								<div className="flex items-center justify-between border-stroke-soft-200 border-b py-2 text-xs dark:border-white/10">
									<span className="text-text-sub-600 dark:text-white/50">Type Safety</span>
									<span className="font-mono text-text-strong-950 dark:text-white">{activeLang.typeSafety}</span>
								</div>
								<div className="flex items-center justify-between border-stroke-soft-200 border-b py-2 text-xs dark:border-white/10">
									<span className="text-text-sub-600 dark:text-white/50">Concurrency</span>
									<span className="font-mono text-text-strong-950 dark:text-white">{activeLang.concurrency}</span>
								</div>
								<div className="flex items-center justify-between border-stroke-soft-200 border-b py-2 text-xs dark:border-white/10">
									<span className="text-text-sub-600 dark:text-white/50">Primary Ecosystems</span>
									<span className="font-sans text-text-strong-950 dark:text-white">{activeLang.primaryFramework}</span>
								</div>
							</div>
						</div>

						{/* Quick Install Bar */}
						<div className="flex flex-col gap-2">
							<span className="font-medium text-text-sub-600 text-xs dark:text-white/50">
								Installation Command
							</span>
							<div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3.5 py-2.5 font-mono text-xs dark:border-white/10 dark:bg-black/40">
								<code className="truncate text-text-strong-950 dark:text-white">
									{activeLang.installCommand}
								</code>
								<button
									type="button"
									onClick={handleCopyInstall}
									className="ml-3 shrink-0 font-sans font-medium text-xs text-primary-base transition-opacity hover:opacity-80"
								>
									{copiedInstall ? "Copied!" : "Copy"}
								</button>
							</div>
						</div>

						<div>
							<Link
								href={activeLang.docsPath}
								className="inline-flex items-center gap-1.5 font-medium text-primary-base text-sm hover:underline"
							>
								Read full {activeLang.name} documentation &rarr;
							</Link>
						</div>
					</div>

					{/* Right Code Block (7 cols) */}
					<div className="relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0d1117] text-white shadow-sm lg:col-span-7 dark:border-white/10">
						{/* Code Header Bar */}
						<div className="flex items-center justify-between border-[#21262d] border-b bg-[#161b22] px-4 py-3">
							<div className="flex items-center gap-2">
								<span className="size-2.5 rounded-full bg-[#ff5f56]" />
								<span className="size-2.5 rounded-full bg-[#ffbd2e]" />
								<span className="size-2.5 rounded-full bg-[#27c93f]" />
								<span className="ml-2 font-mono text-xs text-white/50">
									send_email.{activeLang.slug === "python" ? "py" : activeLang.slug === "go" ? "go" : activeLang.slug === "rust" ? "rs" : activeLang.slug === "ruby" ? "rb" : activeLang.slug === "elixir" ? "ex" : activeLang.slug === "java" ? "java" : activeLang.slug === "dotnet" ? "cs" : activeLang.slug === "php" ? "php" : "ts"}
								</span>
							</div>
							<button
								type="button"
								onClick={handleCopyCode}
								className="font-mono text-xs text-white/60 transition-colors hover:text-white"
							>
								{copiedCode ? "Copied snippet!" : "Copy code"}
							</button>
						</div>

						{/* Code Body */}
						<div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-slate-200">
							<pre className="whitespace-pre">
								<code>{activeLang.sendCode}</code>
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
