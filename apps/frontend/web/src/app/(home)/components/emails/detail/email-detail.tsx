"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "framer-motion";
import { type RefObject, useCallback, useRef, useState } from "react";
import { PAGE_EASE } from "../../domain/_shared/page-motion";
import { AnimateIn } from "../_shared/animate-in";
import type { EmailItem } from "../_shared/data";
import { EmailTimeline } from "./timeline";

export type DetailTabId = "preview" | "plain" | "html" | "raw" | "insights";

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// ignore
		}
	}, [value]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="cursor-pointer rounded p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3 w-3", copied && "text-success-base")}
			/>
		</button>
	);
}

interface InsightCheckItem {
	id: string;
	title: string;
	status: "improvement" | "great";
	statusLabel: string;
	description: string;
	recommendation?: string;
}

function InsightAccordionItem({
	item,
	isOpen,
	onToggle,
}: {
	item: InsightCheckItem;
	isOpen: boolean;
	onToggle: () => void;
}) {
	const isImprovement = item.status === "improvement";

	return (
		<div className="border-stroke-soft-100/60 border-b last:border-b-0 dark:border-neutral-800/80">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full cursor-pointer items-center gap-3 py-3.5 text-left transition-colors hover:opacity-80"
			>
				<Icon
					name="chevron-right"
					className={cn(
						"h-3.5 w-3.5 flex-shrink-0 text-text-sub-600 transition-transform duration-200 dark:text-neutral-500",
						isOpen && "rotate-90",
					)}
				/>
				{isImprovement ? (
					<Icon
						name="alert-triangle"
						className="h-4 w-4 flex-shrink-0 text-amber-500"
					/>
				) : (
					<Icon
						name="check-circle"
						className="h-4 w-4 flex-shrink-0 text-emerald-500"
					/>
				)}
				<span className="flex-1 font-medium text-paragraph-sm text-text-strong-950 dark:text-neutral-100">
					{item.title}
				</span>
				<span className="hidden text-paragraph-xs text-text-sub-600 sm:inline-block dark:text-neutral-400">
					{item.statusLabel}
				</span>
			</button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="space-y-2.5 pb-4 pl-9 text-paragraph-xs text-text-sub-600 dark:text-neutral-400">
							<p className="leading-relaxed">{item.description}</p>
							<div className="flex flex-wrap items-center gap-2 pt-1">
								<span className="font-medium text-text-strong-950 dark:text-neutral-200">
									Current Status:
								</span>
								<span
									className={cn(
										"inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px]",
										isImprovement
											? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
											: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
									)}
								>
									{item.statusLabel}
								</span>
							</div>
							{item.recommendation && (
								<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 text-amber-800 dark:text-amber-300">
									<span className="font-semibold">Recommendation: </span>
									{item.recommendation}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function EmailInsightsPanel() {
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
		{},
	);

	const toggleItem = useCallback((id: string) => {
		setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
	}, []);

	const checks: InsightCheckItem[] = [
		{
			id: "use-subdomain",
			title: "Use a subdomain",
			status: "great",
			statusLabel: "Sent from subdomain (mail.reloop.sh)",
			description:
				"Your email is sent from a dedicated subdomain, protecting your apex domain reputation.",
		},
		{
			id: "click-tracking",
			title: "Use custom subdomain for click tracking",
			status: "great",
			statusLabel: "Branded click tracking active",
			description:
				"Links are tracked through a verified custom domain, building subscriber trust and avoiding anti-phishing heuristic blocks.",
		},
		{
			id: "open-tracking",
			title: "Use custom subdomain for open tracking",
			status: "great",
			statusLabel: "Branded open tracking active",
			description:
				"Open tracking pixels are served from your verified sending subdomain, preventing strict privacy filters from blocking tracking assets.",
		},
		{
			id: "link-domain-match",
			title: "Ensure link URLs match sending domain",
			status: "great",
			statusLabel: "Link destinations match sender domain",
			description:
				"Destination links match your brand identity and verified domain, preventing email providers from treating the message as suspicious.",
		},
		{
			id: "dmarc-record",
			title: "Include valid DMARC record",
			status: "great",
			statusLabel: "DMARC authentication policy valid",
			description:
				"A valid DMARC policy is published and verified on your domain, protecting against unauthorized domain spoofing and satisfying Gmail/Yahoo bulk requirements.",
		},
		{
			id: "plain-text-version",
			title: "Include plain text version",
			status: "great",
			statusLabel: "Plain text version included (184 chars)",
			description:
				"A plain text alternative is included alongside HTML, ensuring accessibility, support for watch/text-only clients, and lower spam scores.",
		},
		{
			id: "body-size",
			title: "Keep email body size small",
			status: "great",
			statusLabel: "2.4 KB (under 102 KB limit)",
			description:
				"Message size is safely below Gmail's 102 KB clipping threshold, ensuring the entire email body and tracking pixel render fully without truncation.",
		},
	];

	return (
		<div className="space-y-6 pt-2 pb-6">
			<div className="space-y-2">
				<h4 className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-neutral-400">
					DOING GREAT
				</h4>
				<div className="border-stroke-soft-100/60 border-t dark:border-neutral-800/80">
					{checks.map((item, index) => (
						<AnimateIn key={item.id} mounted delay={0.04 * index} y={8}>
							<InsightAccordionItem
								item={item}
								isOpen={Boolean(expandedItems[item.id])}
								onToggle={() => toggleItem(item.id)}
							/>
						</AnimateIn>
					))}
				</div>
			</div>
		</div>
	);
}

const HEADER_ROWS = [
	{
		label: "From",
		value: "Reloop <notifications@reloop.sh>",
	},
	{
		label: "To",
		key: "to",
	},
	{
		label: "Date",
		value: "Monday, August 17, 2026 at 06:24 PM",
	},
	{
		label: "Subject",
		key: "subject",
	},
] as const;

export function EmailDetail({
	email,
	mounted = true,
	activeTab = "preview",
	onTabChange,
	tabRefs,
}: {
	email: EmailItem;
	mounted?: boolean;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
	tabRefs?: RefObject<Record<DetailTabId, HTMLButtonElement | null>>;
}) {
	const [internalTab, setInternalTab] = useState("preview");
	const currentTab = onTabChange ? activeTab : internalTab;
	const setTab = onTabChange || setInternalTab;

	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const tabItems = [
		{
			title: "Preview",
			value: "preview" as const,
			icon: "mail-single" as const,
		},
		{
			title: "Plain Text",
			value: "plain" as const,
			icon: "file-text" as const,
		},
		{
			title: "HTML Source",
			value: "html" as const,
			icon: "code" as const,
		},
		{
			title: "Raw",
			value: "raw" as const,
			icon: "file-code" as const,
		},
		{
			title: "Insights",
			value: "insights" as const,
			icon: "bulb" as const,
		},
	];

	const activeIndex = tabItems.findIndex((item) => item.value === currentTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const activeBtn = buttonRefs.current[currentIdx];
	const rect = activeBtn?.getBoundingClientRect();

	const headersData = {
		"Message-ID": `<msg_${email.id}_94a28f@mail.reloop.sh>`,
		From: "Reloop <notifications@reloop.sh>",
		To: email.to,
		Subject: email.subject,
		Date: "Mon, 17 Aug 2026 18:24:10 +0000",
		"Content-Type": 'multipart/alternative; boundary="_=_swift_178294_=_"',
		"MIME-Version": "1.0",
		"X-Entity-ID": `ent_${email.id}`,
		"DKIM-Signature": "v=1; a=rsa-sha256; d=reloop.sh; s=rel1; bh=...",
		"Authentication-Results": "reloop.sh; dkim=pass; spf=pass; dmarc=pass",
	};

	return (
		<div className="space-y-6">
			<section>
				<div className="flex flex-col gap-3.5">
					{HEADER_ROWS.map((row, index) => (
						<AnimateIn
							key={row.label}
							mounted={mounted}
							delay={0.05 + index * 0.045}
							y={10}
						>
							<div className="flex items-start gap-4">
								<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
									{row.label}
								</span>
								<span className="font-medium text-paragraph-sm text-text-strong-950">
									{"value" in row ? row.value : email[row.key]}
								</span>
							</div>
						</AnimateIn>
					))}
				</div>
			</section>

			<AnimateIn mounted={mounted} delay={0.22} y={14}>
				<section>
					<EmailTimeline status={email.status} mounted={mounted} />
				</section>
			</AnimateIn>

			<AnimateIn mounted={mounted} delay={0.3} y={14}>
				<section>
					<TabMenu.Root value={currentTab} onValueChange={setTab}>
						<TabMenu.List className="relative mb-6 h-11 gap-0 border-b! py-0">
							{tabItems.map((item, index) => (
								<TabMenu.Trigger
									key={item.value}
									value={item.value}
									ref={(el) => {
										buttonRefs.current[index] = el;
										if (tabRefs) {
											tabRefs.current[item.value] = el;
										}
									}}
									onPointerEnter={() => setHoveredIdx(index)}
									onPointerLeave={() => setHoveredIdx(undefined)}
									className={cn(
										"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
										hoveredIdx === undefined &&
											activeIndex === index &&
											"text-text-strong-950",
									)}
								>
									<Icon name={item.icon} className="h-4 w-4" />
									{item.title}
								</TabMenu.Trigger>
							))}

							<AnimatePresence>
								{rect && activeIndex !== -1 ? (
									<motion.div
										className="pointer-events-none absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
										initial={{
											width: rect.width,
											height: rect.height - 14,
											left:
												rect.left -
												(activeBtn?.offsetParent?.getBoundingClientRect()
													.left || 0),
											top:
												rect.top -
												(activeBtn?.offsetParent?.getBoundingClientRect().top ||
													0) +
												7,
											opacity: 0,
										}}
										animate={{
											width: rect.width,
											height: rect.height - 14,
											left:
												rect.left -
												(activeBtn?.offsetParent?.getBoundingClientRect()
													.left || 0),
											top:
												rect.top -
												(activeBtn?.offsetParent?.getBoundingClientRect().top ||
													0) +
												7,
											opacity: 1,
										}}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.14 }}
									/>
								) : null}
							</AnimatePresence>
						</TabMenu.List>

						<div
							className={cn(
								"mb-10",
								currentTab === "preview" &&
									"overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50",
							)}
						>
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={currentTab}
									initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
									animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
									exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
									transition={{ duration: 0.32, ease: PAGE_EASE }}
								>
									{currentTab === "preview" && (
										<div className="bg-white p-6 dark:bg-neutral-950">
											<div className="mx-auto max-w-lg space-y-4 py-4">
												<div className="flex items-center gap-3 border-stroke-soft-100 border-b pb-4 dark:border-neutral-800">
													<div className="flex size-9 items-center justify-center rounded-xl bg-primary-base font-semibold text-sm text-white shadow-sm">
														R
													</div>
													<div>
														<h4 className="font-semibold text-sm text-text-strong-950">
															Reloop
														</h4>
														<p className="text-text-sub-600 text-xs">
															High-throughput transactional email engine
														</p>
													</div>
												</div>

												<div className="space-y-3 pt-2 text-sm text-text-sub-600">
													<p className="font-medium text-text-strong-950">
														Hello,
													</p>
													<p>
														Your production API key has been created and is
														ready for use. You can start sending transactional
														emails immediately through the SDK or SMTP
														interface.
													</p>
													<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3 font-mono text-text-strong-950 text-xs dark:border-neutral-800 dark:bg-neutral-900">
														reloop_live_sk_948f29104c8a2b
													</div>
													<p className="text-xs">
														If you did not generate this key, please revoke it
														immediately in your dashboard settings.
													</p>
												</div>

												<div className="pt-2">
													<button
														type="button"
														tabIndex={-1}
														className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-base px-4 py-2 font-medium text-white text-xs shadow-sm hover:bg-primary-base/90"
													>
														View Documentation
														<Icon name="arrow-right" className="size-3.5" />
													</button>
												</div>
											</div>
										</div>
									)}

									{currentTab === "plain" && (
										<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-5 font-mono text-text-sub-600 text-xs dark:border-stroke-soft-100/50 dark:bg-neutral-900">
											<pre className="whitespace-pre-wrap leading-relaxed">
												{`From: Reloop <notifications@reloop.sh>
To: ${email.to}
Subject: ${email.subject}

Hello,

Your production API key has been created and is ready for use.
Key: reloop_live_sk_948f29104c8a2b

View Documentation: https://reloop.sh/docs`}
											</pre>
										</div>
									)}

									{currentTab === "html" && (
										<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-5 font-mono text-text-sub-600 text-xs dark:border-stroke-soft-100/50 dark:bg-neutral-900">
											<pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
												{`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${email.subject}</title>
  </head>
  <body style="font-family: sans-serif; padding: 24px; color: #111;">
    <h2>Reloop</h2>
    <p>Your production API key has been created and is ready for use.</p>
    <code>reloop_live_sk_948f29104c8a2b</code>
  </body>
</html>`}
											</pre>
										</div>
									)}

									{currentTab === "raw" && (
										<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-5 font-mono text-text-sub-600 text-xs dark:border-stroke-soft-100/50 dark:bg-neutral-900">
											<pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
												{`Received: by mail.reloop.sh with SMTP id msg_${email.id}
From: Reloop <notifications@reloop.sh>
To: ${email.to}
Subject: ${email.subject}
Date: Mon, 17 Aug 2026 18:24:10 +0000
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>...`}
											</pre>
										</div>
									)}

									{currentTab === "insights" && <EmailInsightsPanel />}
								</motion.div>
							</AnimatePresence>
						</div>
					</TabMenu.Root>
				</section>
			</AnimateIn>

			<AnimateIn mounted={mounted} delay={0.38} y={14}>
				<section>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-medium text-paragraph-sm text-text-strong-950">
							SMTP Headers
						</h3>
						<CopyButton
							value={JSON.stringify(headersData, null, 2)}
							label="Headers"
						/>
					</div>
					<div className="overflow-auto rounded-xl border border-stroke-soft-100 p-6 dark:border-stroke-soft-100/50">
						<pre className="font-mono text-[11px] text-text-sub-600 leading-relaxed">
							{JSON.stringify(headersData, null, 2)}
						</pre>
					</div>
				</section>
			</AnimateIn>
		</div>
	);
}
