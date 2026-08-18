"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { TemplateTabId } from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

const TAB_ORDER: TemplateTabId[] = ["prompt", "canvas", "variables"];

const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SLIDE_PX = 160;
const SLIDE_MS = 0.28;

const contentVariants = {
	enter: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? SLIDE_PX : dir < 0 ? -SLIDE_PX : 0,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? -SLIDE_PX : dir < 0 ? SLIDE_PX : 0,
	}),
};

/* --- Scene 1: Prompt to Template --- */
function PromptView() {
	return (
		<div className="w-full space-y-4">
			{/* AI Prompt Input Card */}
			<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2.5 dark:border-white/5">
					<div className="flex items-center gap-2">
						<span className="flex size-5 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
							<Icon name="sparkling" className="size-3.5" />
						</span>
						<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
							Natural Language Prompt
						</span>
					</div>
					<span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-medium text-[10px] text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
						Claude 3.7 + React Email
					</span>
				</div>

				<div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3.5 py-2.5 dark:border-purple-400/20 dark:bg-purple-400/5">
					<p className="truncate font-mono text-text-sub-600 text-xs dark:text-white/80">
						"Create a sleek dark-mode welcome email with magic link button, user
						avatar stack, and security footer."
					</p>
					<span className="shrink-0 rounded-md bg-purple-600 px-2.5 py-1 font-medium text-[11px] text-white shadow-xs dark:bg-purple-500">
						Regenerate
					</span>
				</div>
			</div>

			{/* Code & Live Preview Split */}
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr]">
				{/* Generated Code Window */}
				<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-[#0d0d0e] p-4 text-left font-mono text-[12px] text-white/90 shadow-sm dark:border-white/10">
					<div className="flex items-center justify-between border-white/10 border-b pb-2 text-[11px] text-white/40">
						<span>welcome-email.tsx</span>
						<span className="text-emerald-400">✓ Typecheck passed</span>
					</div>
					<pre className="mt-3 overflow-x-auto text-[11.5px] leading-relaxed">
						<code>
							<span className="text-purple-400">export function</span>{" "}
							<span className="text-blue-400">WelcomeEmail</span>
							{"({ user, magicLink }) {"}
							{"\n  "}
							<span className="text-purple-400">return</span> ({"\n    "}
							<span className="text-blue-300">{"<Html>"}</span>
							{"\n      "}
							<span className="text-blue-300">{"<Container "}</span>
							<span className="text-amber-300">className</span>=
							<span className="text-emerald-300">"max-w-md mx-auto p-6"</span>
							<span className="text-blue-300">{">"}</span>
							{"\n        "}
							<span className="text-blue-300">{"<Heading>"}</span>
							Welcome to Acme, {"{user.name}"}
							<span className="text-blue-300">{"</Heading>"}</span>
							{"\n        "}
							<span className="text-blue-300">{"<Button "}</span>
							<span className="text-amber-300">href</span>=
							<span className="text-emerald-300">{"{magicLink}"}</span>
							<span className="text-blue-300">{">"}</span>
							{"\n          "}Verify &amp; Get Started →{"\n        "}
							<span className="text-blue-300">{"</Button>"}</span>
							{"\n      "}
							<span className="text-blue-300">{"</Container>"}</span>
							{"\n    "}
							<span className="text-blue-300">{"</Html>"}</span>
							{"\n  );"}
							{"\n}"}
						</code>
					</pre>
				</div>

				{/* Rendered Email Preview Card */}
				<div className="flex flex-col justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="space-y-3">
						<div className="flex size-7 items-center justify-center rounded-lg bg-text-strong-950 font-bold text-[12px] text-white dark:bg-white dark:text-black">
							A
						</div>
						<div>
							<h4 className="font-semibold text-sm text-text-strong-950 dark:text-white">
								Welcome to Acme, Maya
							</h4>
							<p className="mt-1 text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
								Your workspace is ready. Click the button below to confirm your
								email and start collaborating with your team.
							</p>
						</div>

						<div className="pt-1">
							<span className="inline-flex h-8 items-center justify-center rounded-lg bg-purple-600 px-4 font-medium text-white text-xs shadow-xs dark:bg-purple-500">
								Verify &amp; Get Started →
							</span>
						</div>
					</div>

					<div className="mt-4 border-stroke-soft-100 border-t pt-3 text-[10px] text-text-soft-400 dark:border-white/5 dark:text-white/40">
						Acme Labs Inc. · 100 Montgomery St, San Francisco, CA
					</div>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 2: Visual Canvas & Preview --- */
function CanvasView() {
	const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

	return (
		<div className="w-full space-y-4">
			{/* Canvas Toolbar */}
			<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-text-strong-950 text-xs dark:text-white">
						Canvas:
					</span>
					<span className="rounded-md bg-purple-500/10 px-2 py-0.5 font-mono text-[11px] text-purple-600 dark:text-purple-400">
						order-confirmation.tsx
					</span>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex rounded-lg border border-stroke-soft-200 p-0.5 dark:border-white/10">
						<button
							type="button"
							onClick={() => setDevice("desktop")}
							className={cn(
								"rounded-md px-2.5 py-1 font-medium text-[11px] transition-colors",
								device === "desktop"
									? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							Desktop
						</button>
						<button
							type="button"
							onClick={() => setDevice("mobile")}
							className={cn(
								"rounded-md px-2.5 py-1 font-medium text-[11px] transition-colors",
								device === "mobile"
									? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							Mobile
						</button>
					</div>
					<span className="rounded-lg bg-text-strong-950 px-3 py-1 font-medium text-white text-xs dark:bg-white dark:text-black">
						Save &amp; Export
					</span>
				</div>
			</div>

			{/* Canvas Visual Body */}
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_minmax(0,1fr)_200px]">
				{/* Component Palette */}
				<div className="hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm lg:block dark:border-white/10 dark:bg-white/[0.03]">
					<span className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
						Components
					</span>
					<div className="mt-2 space-y-1.5 text-xs">
						{[
							"Hero Section",
							"Action Button",
							"Price Table",
							"Social Links",
							"Spacer / Divider",
						].map((item) => (
							<div
								key={item}
								className="flex cursor-grab items-center gap-2 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-2 text-text-sub-600 transition-colors hover:border-purple-500/30 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60 dark:hover:text-white"
							>
								<span className="size-1.5 rounded-full bg-purple-500" />
								{item}
							</div>
						))}
					</div>
				</div>

				{/* Center Live Canvas */}
				<div
					className={cn(
						"mx-auto flex flex-col justify-between rounded-xl border-2 border-purple-500/30 border-dashed bg-bg-white-0 p-5 shadow-sm transition-all duration-200 dark:border-purple-400/20 dark:bg-white/[0.03]",
						device === "mobile" ? "max-w-[280px]" : "w-full",
					)}
				>
					<div className="space-y-3">
						<div className="rounded-lg border border-purple-500/40 bg-purple-500/5 p-3 dark:border-purple-400/30 dark:bg-purple-400/5">
							<span className="font-mono text-[10px] text-purple-600 dark:text-purple-400">
								Hero Block [Selected]
							</span>
							<p className="mt-1 font-semibold text-text-strong-950 text-xs dark:text-white">
								Payment Received: $49.00
							</p>
						</div>

						<div className="rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]">
							<div className="flex justify-between font-mono text-[11px] text-text-sub-600 dark:text-white/60">
								<span>Invoice #ACME-8921</span>
								<span>Paid</span>
							</div>
						</div>
					</div>

					<div className="pt-2">
						<span className="flex h-7.5 w-full items-center justify-center rounded-lg bg-text-strong-950 font-medium text-white text-xs dark:bg-white dark:text-black">
							View Receipt PDF
						</span>
					</div>
				</div>

				{/* Style Properties Inspector */}
				<div className="hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm lg:block dark:border-white/10 dark:bg-white/[0.03]">
					<span className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
						Properties
					</span>
					<div className="mt-2.5 space-y-2 text-xs">
						<div>
							<span className="text-[10px] text-text-soft-400 dark:text-white/40">
								Font Family
							</span>
							<div className="mt-1 rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 p-1.5 font-mono text-[11px] text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white">
								Geist Sans
							</div>
						</div>
						<div>
							<span className="text-[10px] text-text-soft-400 dark:text-white/40">
								Border Radius
							</span>
							<div className="mt-1 rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 p-1.5 font-mono text-[11px] text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white">
								12px
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 3: Variables & Components --- */
function VariablesView() {
	return (
		<div className="w-full space-y-4">
			{/* Top Summary Schema Card */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{
						name: "{{ user.firstName }}",
						sample: "Maya",
						type: "string",
					},
					{
						name: "{{ invoice.amount }}",
						sample: "$499.00",
						type: "currency",
					},
					{
						name: "{{ plan.tier }}",
						sample: "Enterprise",
						type: "enum",
					},
					{
						name: "{{ magicLink }}",
						sample: "https://acme...",
						type: "url",
					},
				].map((v) => (
					<div
						key={v.name}
						className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
					>
						<span className="font-mono text-purple-600 text-xs dark:text-purple-400">
							{v.name}
						</span>
						<p className="mt-1 font-semibold text-text-strong-950 text-xs dark:text-white">
							{v.sample}
						</p>
						<span className="text-[10px] text-text-soft-400 uppercase dark:text-white/40">
							{v.type}
						</span>
					</div>
				))}
			</div>

			{/* Schema Inspector + Live Substitution */}
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="border-stroke-soft-100 border-b pb-2.5 dark:border-white/5">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							TypeScript Props Schema
						</span>
					</div>

					<pre className="mt-3 overflow-x-auto font-mono text-[11.5px] text-text-sub-600 dark:text-white/70">
						<code>
							{"interface WelcomeProps {\n"}
							{"  user: { firstName: string; email: string };\n"}
							{"  invoice?: { amount: number; date: Date };\n"}
							{"  cta: { label: string; url: string };\n"}
							{"}"}
						</code>
					</pre>
				</div>

				<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
					<div className="flex items-center justify-between border-stroke-soft-100 border-b pb-2.5 dark:border-white/5">
						<span className="font-medium text-text-strong-950 text-xs dark:text-white">
							Live Test Preview
						</span>
						<span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
							Payload Valid
						</span>
					</div>

					<div className="mt-3 space-y-2 text-xs">
						<p className="text-text-sub-600 dark:text-white/70">
							"Hi <strong className="text-purple-600">Maya</strong>, your{" "}
							<strong className="text-purple-600">Enterprise</strong> plan
							invoice of <strong className="text-purple-600">$499.00</strong> is
							ready."
						</p>
						<div className="rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 p-2 font-mono text-[10.5px] text-text-soft-400 dark:border-white/5 dark:bg-white/[0.02]">
							{"{ user: { firstName: 'Maya' }, plan: { tier: 'Enterprise' } }"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* --- Main PreviewStage Component --- */
export function PreviewStage() {
	const shouldReduceMotion = useReducedMotion();
	const [active, setActive] = useState<TemplateTabId>("prompt");
	const [direction, setDirection] = useState(0);

	const handleTabChange = (newTab: TemplateTabId) => {
		if (newTab === active) return;
		const from = TAB_ORDER.indexOf(active);
		const to = TAB_ORDER.indexOf(newTab);
		if (from !== -1 && to !== -1) {
			setDirection(to > from ? 1 : -1);
		} else {
			setDirection(0);
		}
		setActive(newTab);
	};

	return (
		<div className="bg-bg-weak-50/60 dark:bg-white/[0.015]">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto min-h-[25rem] max-w-5xl px-5 pt-8 pb-10 sm:px-8 sm:pt-10 lg:px-10">
					<AnimatePresence initial={false} custom={direction} mode="popLayout">
						<motion.div
							key={active}
							custom={direction}
							variants={contentVariants}
							initial={shouldReduceMotion ? false : "enter"}
							animate="center"
							exit={shouldReduceMotion ? undefined : "exit"}
							transition={
								shouldReduceMotion
									? { duration: 0 }
									: { duration: SLIDE_MS, ease: EASE_DEFAULT }
							}
							className="relative w-full"
						>
							{active === "prompt" ? (
								<PromptView />
							) : active === "canvas" ? (
								<CanvasView />
							) : (
								<VariablesView />
							)}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
