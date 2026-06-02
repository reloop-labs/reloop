"use client";

import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import type { LanguageDefinition } from "../languages";

export default function LanguageCode({ language }: { language: LanguageDefinition }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(language.sendCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<section id="code" className="scroll-mt-10">
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="mx-auto mb-12 max-w-3xl text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						Quickstart
					</p>
					<h2 className="mt-4 font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem]">
						Send your first email
					</h2>
					<p className="mx-auto mt-6 max-w-[620px] text-[15px] text-text-sub-600 leading-relaxed dark:text-white/50">
						Install the SDK, set your API key, and call{" "}
						<code className="font-mono text-primary-base">emails.send</code>.
					</p>
				</div>

				<div className="rounded-4xl border border-stroke-soft-200 bg-bg-weak-50 p-6 md:p-8 dark:border-white/10">
					<div className="mb-4 flex flex-col gap-3 border-stroke-soft-200 border-b pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
						<code className="rounded-lg border border-stroke-soft-200 bg-bg-soft-50 px-3 py-2 font-mono text-[13px] text-text-strong-950 dark:border-white/10 dark:text-white">
							{language.installCommand}
						</code>
					</div>

					<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0a0a0a] font-mono text-[13px] leading-relaxed dark:border-white/10">
						<div className="flex items-center justify-between border-white/5 border-b px-4 py-2 text-white/40 text-xs">
							<span>send_email.{language.slug === "dotnet" ? "cs" : language.slug}</span>
							<button
								type="button"
								onClick={handleCopy}
								className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5 hover:text-white"
							>
								<Icon name="copy" className="size-3.5" />
								{copied ? "Copied" : "Copy"}
							</button>
						</div>
						<pre className="max-h-[420px] overflow-auto p-4 text-white/80">
							{language.sendCode}
						</pre>
					</div>
				</div>
			</div>
		</section>
	);
}
