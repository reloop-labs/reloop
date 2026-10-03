"use client";

import { cn } from "@reloop/ui/cn";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { TwitterAutomationShowcase } from "./components/twitter-automation-showcase";
import { TwitterContactIdShowcase } from "./components/twitter-contact-id-showcase";
import { TwitterCreateWebhookComparison } from "./components/twitter-create-webhook-comparison";
import { TwitterDeleteApiKeyComparison } from "./components/twitter-delete-api-key-comparison";
import { TwitterEditContactComparison } from "./components/twitter-edit-contact-comparison";
import { TwitterManifestoShowcase } from "./components/twitter-manifesto-showcase";
import { TwitterModalsShowcase } from "./components/twitter-modals-showcase";

type ShowcaseKey =
	| "manifesto"
	| "edit-contact"
	| "create-webhook"
	| "delete-api-key"
	| "automation"
	| "modals"
	| "contact-id";

const SHOWCASES: { id: ShowcaseKey; label: string; badge?: string }[] = [
	{ id: "manifesto", label: "Email Manifesto", badge: "New" },
	{ id: "edit-contact", label: "Edit Contact Modal" },
	{ id: "create-webhook", label: "Create Webhook" },
	{ id: "delete-api-key", label: "Delete API Key" },
	{ id: "automation", label: "Slide to Publish" },
	{ id: "modals", label: "Modals Showcase" },
	{ id: "contact-id", label: "Contact ID Badge" },
];

export function TwitterShowcaseView() {
	const [activeShowcase, setActiveShowcase] = useState<ShowcaseKey>("manifesto");
	const [selectorOpen, setSelectorOpen] = useState(false);
	const [showBar, setShowBar] = useState(false);

	return (
		<div className="relative min-h-dvh w-full">
			{/* Top Bar Switcher (Hidden by default for pristine screenshotting, toggleable with hovering or button) */}
			{showBar ? (
				<div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/90 px-4 py-2 text-xs text-white backdrop-blur-md">
					<div className="flex items-center gap-2">
						<div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 font-bold text-[10px] text-white">
							𝕏
						</div>
						<span className="font-semibold text-zinc-300">Twitter Graphic Lab</span>
					</div>

					{/* Showcase picker pills */}
					<div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-md:hidden">
						{SHOWCASES.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => setActiveShowcase(item.id)}
								className={cn(
									"flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
									activeShowcase === item.id
										? "bg-white text-black shadow-sm"
										: "text-zinc-400 hover:bg-white/10 hover:text-white",
								)}
							>
								<span>{item.label}</span>
								{item.badge && (
									<span className="rounded bg-white/20 px-1 py-0.2 font-mono text-[9px] text-zinc-200 font-semibold">
										{item.badge}
									</span>
								)}
							</button>
						))}
					</div>

					{/* Mobile dropdown */}
					<div className="relative md:hidden">
						<button
							type="button"
							onClick={() => setSelectorOpen((v) => !v)}
							className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white"
						>
							<span>
								{SHOWCASES.find((s) => s.id === activeShowcase)?.label}
							</span>
							<ChevronDown className="h-3.5 w-3.5 opacity-60" />
						</button>

						{selectorOpen && (
							<div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/15 bg-zinc-950 p-1 shadow-2xl">
								{SHOWCASES.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => {
											setActiveShowcase(item.id);
											setSelectorOpen(false);
										}}
										className={cn(
											"flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs",
											activeShowcase === item.id
												? "bg-white/20 text-white font-semibold"
												: "text-zinc-400 hover:bg-white/10 hover:text-white",
										)}
									>
										<span>{item.label}</span>
										{item.badge && (
											<span className="text-[10px] text-blue-400">
												{item.badge}
											</span>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={() => setShowBar(false)}
						className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
					>
						Hide Bar
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setShowBar(true)}
					className="fixed top-3 left-3 z-50 rounded-full border border-white/10 bg-black/40 px-3 py-1 font-mono text-[10px] text-zinc-500 backdrop-blur-sm transition opacity-20 hover:opacity-100 hover:text-zinc-200"
				>
					Switch Showcase
				</button>
			)}

			{/* Active Component */}
			<div>
				{activeShowcase === "manifesto" && <TwitterManifestoShowcase />}
				{activeShowcase === "edit-contact" && (
					<div className="flex min-h-dvh w-full items-center justify-center bg-white p-6 py-12 antialiased dark:bg-[#080808]">
						<TwitterEditContactComparison />
					</div>
				)}
				{activeShowcase === "create-webhook" && (
					<TwitterCreateWebhookComparison />
				)}
				{activeShowcase === "delete-api-key" && (
					<div className="flex min-h-dvh w-full items-center justify-center bg-white p-6 py-12 antialiased dark:bg-[#080808]">
						<TwitterDeleteApiKeyComparison />
					</div>
				)}
				{activeShowcase === "automation" && <TwitterAutomationShowcase />}
				{activeShowcase === "modals" && <TwitterModalsShowcase />}
				{activeShowcase === "contact-id" && (
					<div className="flex min-h-dvh w-full items-center justify-center bg-white p-6 py-12 antialiased dark:bg-[#080808]">
						<TwitterContactIdShowcase />
					</div>
				)}
			</div>
		</div>
	);
}
