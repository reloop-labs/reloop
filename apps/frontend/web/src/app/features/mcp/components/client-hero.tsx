"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	MCP_PAGE_PATH,
	MCP_SERVER_URL,
	type McpClientDefinition,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { McpClientIcon } from "./client-icons";

const filledButtonClassName = `${Button.buttonVariants({
	variant: "neutral",
	mode: "filled",
}).root()} inline-flex h-9! min-w-[9.25rem] cursor-pointer items-center justify-center gap-2! overflow-hidden rounded-full! px-5! font-medium text-sm! active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-white/90`;

const strokeButtonClassName =
	"dark:hover:!bg-[#0A0A0A] inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-4 font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 active:scale-[0.98] dark:border-white/15 dark:bg-black dark:text-white";

/** Product fold for /features/mcp/[client], same chrome as the framework pages. */
export default function McpClientHero({
	client,
}: {
	client: McpClientDefinition;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(MCP_SERVER_URL);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	};

	const copyButton = (
		<button
			type="button"
			onClick={handleCopyUrl}
			aria-label={copied ? "Copied" : "Copy server URL"}
			className={
				client.installLink ? strokeButtonClassName : filledButtonClassName
			}
		>
			{/* Same spring swap as the framework copy-prompt button */}
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={copied ? "copied" : "idle"}
					transition={{ type: "spring", duration: 0.25, bounce: 0 }}
					initial={{ opacity: 0, y: -14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 14 }}
					className="flex items-center justify-center gap-1.5"
				>
					<Icon
						name={copied ? "check-circle" : "copy"}
						className="size-4 shrink-0"
					/>
					<span>{copied ? "Copied!" : "Copy server URL"}</span>
				</motion.span>
			</AnimatePresence>
		</button>
	);

	return (
		<section className="relative w-full border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 md:max-w-7xl xl:border-x dark:border-white/10">
				{/* Top meta row: breadcrumb + transport */}
				<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b border-dashed px-6 pt-28 pb-4 sm:px-10 sm:pt-32 lg:px-12 dark:border-white/10">
					<nav
						aria-label="Breadcrumb"
						className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.14em] dark:text-white/45"
					>
						<Link
							href="/features"
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							Features
						</Link>
						<span className="text-text-soft-400 dark:text-white/25">/</span>
						<Link
							href={MCP_PAGE_PATH}
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							MCP
						</Link>
						<span className="text-text-soft-400 dark:text-white/25">/</span>
						<span className="text-text-sub-600 dark:text-white/50">
							{client.name}
						</span>
					</nav>
					<span className="shrink-0 font-mono text-[10px] text-text-sub-600 uppercase tracking-[0.12em] dark:text-white/40">
						[Remote MCP · OAuth]
					</span>
				</div>

				{/* Product fold: icon + title + sub + CTA */}
				<div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
					<div className="relative z-10 flex items-start gap-4 sm:gap-5">
						<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] sm:size-20 dark:border-white/10 dark:bg-bg-black-950 dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]">
							<McpClientIcon slug={client.slug} className="size-8 sm:size-10" />
						</div>

						<div className="min-w-0 flex-1">
							<h1 className="flex min-h-16 items-center font-semibold text-3xl text-text-strong-950 tracking-tight sm:min-h-20 sm:text-4xl lg:text-[2.5rem] dark:text-white">
								Reloop MCP for {client.name}
							</h1>
							<p className="mt-2 max-w-xl text-[15px] text-text-sub-600 leading-relaxed sm:text-[16px] dark:text-white/60">
								{client.intro}
							</p>

							<div className="mt-6 flex flex-wrap items-center gap-3">
								{client.installLink && (
									<a
										href={client.installLink.href}
										className={filledButtonClassName}
									>
										<Icon name="plus-circle" className="size-4 shrink-0" />
										<span>{client.installLink.label}</span>
									</a>
								)}
								{copyButton}
								<code className="hidden rounded-full border border-stroke-soft-200 px-3 py-1.5 font-mono text-[12px] text-text-sub-600 sm:inline-block dark:border-white/10 dark:text-white/55">
									{MCP_SERVER_URL}
								</code>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
