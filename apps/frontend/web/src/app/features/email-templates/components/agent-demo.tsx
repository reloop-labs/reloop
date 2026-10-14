"use client";

import { acmeTemplateExamples } from "@reloop/email-templates";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useRef, useState } from "react";
import {
	CARD_ONLY_PREVIEW_CSS,
	EmailPreview,
	withSampleValues,
} from "../../../tools/email-html-editor/components/template-card";

const PROMPT =
	"Order confirmation for Acme. Match the style of this screenshot, keep it minimal, and add a button to view the order.";

/** Mirrors the template agent's real pipeline: references → plan → HTML → variables → critique. */
const STEPS: { title: string; detail: string; variables?: string[] }[] = [
	{
		title: "Reading your reference",
		detail: "Matched the layout and palette from inspiration.png",
	},
	{
		title: "Planning the layout",
		detail: "Logo, greeting, order summary, button, footer",
	},
	{
		title: "Writing the email",
		detail: "Email-safe HTML, built on React Email",
	},
	{
		title: "Adding variables",
		detail: "Found 3 values your app fills in at send time",
		variables: ["first_name", "order_number", "order_url"],
	},
	{
		title: "Checking quality",
		detail: "Score 96/100. Ready to edit and publish.",
	},
];

/** Step at which the generated email appears in the preview. */
const PREVIEW_STEP = 2;
const STEP_MS = 1100;

const template = (() => {
	const found = acmeTemplateExamples.find(
		(t) => t.id === "acme-order-confirmation",
	);
	return found ? withSampleValues(found) : null;
})();

/** Tiny drawn screenshot standing in for the user's uploaded inspiration. */
function ReferenceThumb() {
	return (
		<span
			aria-hidden
			className="flex h-14 w-11 shrink-0 flex-col gap-1 overflow-hidden rounded-md border border-stroke-soft-200 bg-white p-1.5 shadow-xs dark:border-white/15"
		>
			<span className="h-1 w-3 rounded-full bg-neutral-900" />
			<span className="mt-0.5 h-1 w-7 rounded-full bg-neutral-300" />
			<span className="h-1 w-6 rounded-full bg-neutral-200" />
			<span className="mt-auto h-2 w-5 rounded-[3px] bg-neutral-900" />
		</span>
	);
}

function StepIcon({ state }: { state: "done" | "running" }) {
	if (state === "running") {
		return (
			<span className="flex size-5 shrink-0 items-center justify-center">
				<span className="size-3.5 animate-spin rounded-full border-[1.5px] border-stroke-soft-200 border-t-text-strong-950 dark:border-white/15 dark:border-t-white" />
			</span>
		);
	}
	return (
		<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-text-strong-950 text-text-white-0 dark:bg-white dark:text-black">
			<Icon name="check" className="size-3" aria-hidden />
		</span>
	);
}

export function AgentDemo() {
	// Index of the step currently running; STEPS.length means finished.
	const [active, setActive] = useState(-1);

	const rootRef = useRef<HTMLDivElement>(null);

	// Run the agent once the demo scrolls into view, so visitors see it work.
	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setActive(STEPS.length);
			return;
		}
		const timers: number[] = [];
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return;
				observer.disconnect();
				for (let i = 0; i <= STEPS.length; i++) {
					timers.push(window.setTimeout(() => setActive(i), 400 + i * STEP_MS));
				}
			},
			{ threshold: 0.35 },
		);
		observer.observe(root);
		return () => {
			observer.disconnect();
			timers.forEach(window.clearTimeout);
		};
	}, []);

	const done = active >= STEPS.length;
	const showPreview = active > PREVIEW_STEP;

	return (
		<div
			ref={rootRef}
			className="grid overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)] sm:rounded-2xl lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] dark:border-white/10 dark:bg-black dark:shadow-black/60"
		>
			{/* Agent pane */}
			<div className="flex min-h-[420px] flex-col border-stroke-soft-100 border-b lg:min-h-[560px] lg:border-r lg:border-b-0 dark:border-white/10">
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-4 py-3 sm:px-5 dark:border-white/10">
					<Icon
						name="sparkling"
						className="size-4 text-text-strong-950 dark:text-white"
						aria-hidden
					/>
					<span className="font-medium text-[13.5px] text-text-strong-950 dark:text-white">
						Template agent
					</span>
				</div>

				<div className="flex flex-1 flex-col gap-5 px-4 py-5 sm:px-5">
					<div className="ml-auto flex max-w-[92%] flex-col items-end gap-2">
						<div className="flex items-center gap-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-1.5 pr-3 dark:border-white/10 dark:bg-white/[0.04]">
							<ReferenceThumb />
							<span className="flex flex-col">
								<span className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
									inspiration.png
								</span>
								<span className="text-[11.5px] text-text-soft-400 dark:text-white/40">
									Reference image
								</span>
							</span>
						</div>
						<p className="rounded-2xl rounded-tr-md bg-bg-weak-50 px-3.5 py-2.5 text-[13.5px] text-text-strong-950 leading-relaxed dark:bg-white/[0.06] dark:text-white">
							{PROMPT}
						</p>
					</div>

					<ol className="flex flex-col gap-3.5" aria-live="polite">
						{STEPS.map((step, index) => {
							if (index > active) return null;
							const state = index < active ? "done" : "running";
							return (
								<li
									key={step.title}
									className="flex starting:translate-y-1 items-start gap-3 starting:opacity-0 transition-[opacity,translate] duration-300 ease-out"
								>
									<StepIcon state={state} />
									<div className="flex min-w-0 flex-col gap-1">
										<span
											className={cn(
												"font-medium text-[13.5px]",
												state === "done"
													? "text-text-strong-950 dark:text-white"
													: "text-text-sub-600 dark:text-white/60",
											)}
										>
											{step.title}
										</span>
										{state === "done" && (
											<span className="text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/50">
												{step.detail}
											</span>
										)}
										{state === "done" && step.variables && (
											<span className="flex flex-wrap gap-1.5 pt-0.5">
												{step.variables.map((name) => (
													<code
														key={name}
														className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[11.5px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80"
													>
														{`{{{${name}}}}`}
													</code>
												))}
											</span>
										)}
									</div>
								</li>
							);
						})}
					</ol>

					<div className="mt-auto flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 py-1.5 pr-1.5 pl-3.5 dark:border-white/10 dark:bg-white/[0.03]">
						<span className="flex-1 truncate text-[13px] text-text-soft-400 dark:text-white/35">
							{done ? "Ask for changes…" : "Designing your email…"}
						</span>
						<span
							aria-hidden
							className="flex size-7 items-center justify-center rounded-lg bg-text-strong-950 text-text-white-0 dark:bg-white dark:text-black"
						>
							<Icon name="arrow-top" className="size-3.5" />
						</span>
					</div>
				</div>
			</div>

			{/* Generated email */}
			<div className="relative flex items-start justify-center bg-bg-weak-50 px-4 pt-6 sm:px-10 sm:pt-10 dark:bg-white/[0.02]">
				<div
					className={cn(
						"w-full max-w-[520px] transition-all duration-700 ease-out",
						showPreview
							? "translate-y-0 opacity-100"
							: "translate-y-3 opacity-0",
					)}
				>
					{template && (
						<EmailPreview
							template={template}
							previewCss={CARD_ONLY_PREVIEW_CSS}
							className="aspect-[5/6] rounded-b-none shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]"
						/>
					)}
				</div>
				{!showPreview && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="flex items-center gap-2 text-[13px] text-text-soft-400 dark:text-white/35">
							<Icon name="sparkling" className="size-4" aria-hidden />
							Your email appears here
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
