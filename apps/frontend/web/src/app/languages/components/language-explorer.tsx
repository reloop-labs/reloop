"use client";

import * as Button from "@reloop/ui/button";
import Link from "next/link";
import { useState } from "react";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";

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

export default function LanguageExplorer() {
	const [activeSlug, setActiveSlug] = useState(languages[0]!.slug);
	const [copiedInstall, setCopiedInstall] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);

	const active = languages.find((l) => l.slug === activeSlug) ?? languages[0]!;
	const ext = EXT_BY_SLUG[active.slug] ?? "ts";
	const brandColor = `#${active.icon.hex}`;

	const copyInstall = async () => {
		await navigator.clipboard.writeText(active.installCommand);
		setCopiedInstall(true);
		setTimeout(() => setCopiedInstall(false), 2000);
	};

	const copyCode = async () => {
		await navigator.clipboard.writeText(active.sendCode);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	return (
		<section
			id="languages"
			className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Header */}
				<div className="border-stroke-soft-200 border-b px-6 py-10 sm:px-10 sm:py-12 lg:px-12 dark:border-white/10">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						Pick your runtime.
					</h2>
					<p className="mt-1.5 max-w-xl text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Switch languages to see install and sample code.
					</p>
				</div>

				{/* Language tabs */}
				<div className="border-stroke-soft-200 border-b dark:border-white/10">
					<div
						role="tablist"
						aria-label="SDK languages"
						className="flex gap-1 overflow-x-auto px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8"
					>
						{languages.map((lang) => {
							const isActive = lang.slug === activeSlug;
							return (
								<button
									key={lang.slug}
									type="button"
									role="tab"
									aria-selected={isActive}
									id={`lang-tab-${lang.slug}`}
									aria-controls="lang-panel"
									onClick={() => {
										setActiveSlug(lang.slug);
										setCopiedInstall(false);
										setCopiedCode(false);
									}}
									className={[
										"inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 font-medium text-xs transition-colors duration-150",
										isActive
											? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
											: "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white",
									].join(" ")}
								>
									<span
										style={{
											color: isActive ? "currentColor" : `#${lang.icon.hex}`,
										}}
									>
										<LanguageIcon icon={lang.icon} className="size-3.5" />
									</span>
									{lang.name}
								</button>
							);
						})}
					</div>
				</div>

				{/* Content: left meta + right code */}
				<div
					id="lang-panel"
					role="tabpanel"
					aria-labelledby={`lang-tab-${active.slug}`}
					className="grid grid-cols-1 lg:grid-cols-12"
				>
					{/* Left */}
					<div className="flex flex-col justify-between gap-8 border-stroke-soft-200 p-6 sm:p-8 lg:col-span-4 lg:border-r lg:p-10 dark:border-white/10">
						<div>
							<div className="flex items-center gap-3">
								<div
									className="inline-flex size-11 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]"
									style={{ color: brandColor }}
								>
									<LanguageIcon icon={active.icon} className="size-5" />
								</div>
								<div className="min-w-0">
									<h3 className="font-semibold text-base text-text-strong-950 tracking-tight dark:text-white">
										{active.name}
									</h3>
									<p className="truncate font-mono text-[11px] text-text-sub-600 dark:text-white/45">
										{active.packageName}
									</p>
								</div>
							</div>

							<p className="mt-5 text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
								{active.shortDescription}
							</p>

							<p className="mt-4 text-[12px] text-text-sub-600 dark:text-white/45">
								<span className="text-text-strong-950 dark:text-white/70">
									Works with
								</span>{" "}
								{active.primaryFramework}
							</p>
						</div>

						<div className="flex flex-col gap-4">
							<div>
								<p className="font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/45">
									Install
								</p>
								<div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
									<code className="truncate font-mono text-[12px] text-text-strong-950 dark:text-white">
										{active.installCommand}
									</code>
									<button
										type="button"
										onClick={copyInstall}
										className="shrink-0 font-medium text-text-strong-950 text-xs underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
									>
										{copiedInstall ? "Copied" : "Copy"}
									</button>
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								<a
									href="/dashboard/signup"
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "filled",
									}).root()} inline-flex h-9! rounded-full! px-4! font-medium text-xs! dark:bg-white dark:text-black dark:hover:bg-white/90`}
								>
									Get API Key
								</a>
								<Link
									href={`/languages/${active.slug}`}
									className={`${Button.buttonVariants({
										variant: "neutral",
										mode: "stroke",
									}).root()} inline-flex h-9! rounded-full! px-4! font-medium text-xs!`}
								>
									{active.name} guide →
								</Link>
							</div>
						</div>
					</div>

					{/* Right: code */}
					<div className="relative overflow-hidden border-stroke-soft-200 border-t bg-[#0d1117] text-white lg:col-span-8 lg:border-t-0 dark:border-white/10">
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
								onClick={copyCode}
								className="font-mono text-white/60 text-xs transition-colors hover:text-white"
							>
								{copiedCode ? "Copied" : "Copy code"}
							</button>
						</div>
						<div className="max-h-[min(28rem,70vh)] overflow-auto p-5 font-mono text-[13px] text-slate-200 leading-relaxed sm:p-6">
							<pre className="whitespace-pre">
								<code key={active.slug}>{active.sendCode}</code>
							</pre>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
