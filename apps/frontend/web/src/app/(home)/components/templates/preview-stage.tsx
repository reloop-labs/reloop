"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { TemplateTabId } from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

const TAB_ORDER: TemplateTabId[] = [
	"ai-templates",
	"realtime-editor",
	"version-history",
];

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

/* --- Scene 1: AI Email Templates View (Minimalist Chat + Email Sheet Preview) --- */
function AiTemplatesView() {
	return (
		<div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0c0e]">
			<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 sm:grid-cols-[1.05fr_1.1fr] sm:divide-x sm:divide-y-0 dark:divide-white/10">
				{/* Left Panel: Chat Interface */}
				<div className="flex min-h-[440px] flex-col justify-between p-5 sm:p-6">
					{/* Message Stream */}
					<div className="space-y-3.5">
						{/* User Message 1 */}
						<div className="flex flex-col items-end">
							<div className="rounded-2xl rounded-tr-xs bg-bg-weak-50 px-3.5 py-2 text-text-strong-950 text-xs dark:bg-white/[0.06] dark:text-white">
								<p className="font-mono text-[11px] leading-relaxed">
									Build an order confirmation receipt with item breakdown and
									PDF download
								</p>
							</div>
						</div>

						{/* AI Response 1 with Skeletons */}
						<div className="space-y-1.5 pt-0.5">
							<div className="flex items-center gap-1.5 text-[10px] text-text-soft-400 dark:text-white/40">
								<span className="size-1.5 rounded-full bg-emerald-500" />
								<span>Reloop AI</span>
							</div>

							<div className="space-y-1.5 rounded-xl rounded-tl-xs border border-stroke-soft-100 bg-bg-weak-50/40 p-2.5 dark:border-white/5 dark:bg-white/[0.02]">
								<div className="h-2 w-3/4 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
								<div className="h-2 w-1/2 rounded-full bg-stroke-soft-200 dark:bg-white/10" />
							</div>
						</div>

						{/* User Follow-up Message */}
						<div className="flex flex-col items-end">
							<div className="rounded-2xl rounded-tr-xs bg-bg-weak-50 px-3.5 py-2 text-text-strong-950 text-xs dark:bg-white/[0.06] dark:text-white">
								<p className="font-mono text-[11px] leading-relaxed">
									Add line item table for Pro Plan and dedicated IP
								</p>
							</div>
						</div>

						{/* AI Response 2 with Skeletons */}
						<div className="space-y-1.5">
							<div className="space-y-1.5 rounded-xl rounded-tl-xs border border-stroke-soft-100 bg-bg-weak-50/40 p-2.5 dark:border-white/5 dark:bg-white/[0.02]">
								<div className="h-2 w-5/6 rounded-full bg-stroke-soft-200 dark:bg-white/15" />
								<div className="h-2 w-3/5 rounded-full bg-stroke-soft-100 dark:bg-white/10" />
							</div>

							{/* Thinking Dots */}
							<div className="flex items-center gap-1 pl-1 text-text-soft-400 text-xs dark:text-white/40">
								<span className="size-1 animate-bounce rounded-full bg-text-soft-400 [animation-delay:-0.3s] dark:bg-white/40" />
								<span className="size-1 animate-bounce rounded-full bg-text-soft-400 [animation-delay:-0.15s] dark:bg-white/40" />
								<span className="size-1 animate-bounce rounded-full bg-text-soft-400 dark:bg-white/40" />
							</div>
						</div>
					</div>

					{/* Bottom Chat Prompt Input */}
					<div className="mt-4 flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-weak-50/50 p-1.5 pl-3 dark:border-white/10 dark:bg-white/[0.02]">
						<div className="flex items-center gap-1 text-[11px] text-text-soft-400 dark:text-white/40">
							<span>Ask agent to edit styles or wire props...</span>
							<span className="animate-pulse text-text-strong-950 dark:text-white">
								|
							</span>
						</div>
						<button
							type="button"
							className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FF5722] text-white shadow-xs transition-opacity hover:opacity-90 dark:bg-[#FF6E40]"
							title="Send prompt"
						>
							<span className="font-bold text-xs">↑</span>
						</button>
					</div>
				</div>

				{/* Right Panel: Email Document Sheet with Skeletons */}
				<div className="flex min-h-[440px] items-center justify-center bg-bg-weak-50/30 p-5 sm:p-6 dark:bg-white/[0.01]">
					<div className="w-full max-w-[280px] space-y-3.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-xs dark:border-white/10 dark:bg-[#111114]">
						{/* Document Header Skeleton Bars */}
						<div className="space-y-1.5">
							<div className="h-3 w-3/4 rounded-full bg-text-strong-950/80 dark:bg-white/80" />
							<div className="h-2 w-1/2 rounded-full bg-stroke-soft-200 dark:bg-white/20" />
						</div>

						{/* Body Skeletons */}
						<div className="space-y-1 pt-0.5">
							<div className="h-1.5 w-full rounded-full bg-stroke-soft-100 dark:bg-white/10" />
							<div className="h-1.5 w-4/5 rounded-full bg-stroke-soft-100 dark:bg-white/10" />
						</div>

						{/* Transactional Invoice Card with Breakdown */}
						<div className="rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-3 text-xs dark:border-white/5 dark:bg-white/[0.02]">
							<div className="flex items-center justify-between font-mono text-[10px] text-text-sub-600 dark:text-white/70">
								<span>Invoice #ACME-8921</span>
								<span className="font-semibold text-text-strong-950 dark:text-white">
									$64.00
								</span>
							</div>
							<div className="mt-2 space-y-1 border-stroke-soft-100 border-t pt-1.5 text-[9.5px] dark:border-white/5">
								<div className="flex justify-between text-text-sub-600 dark:text-white/70">
									<span>Pro Developer Plan</span>
									<span>$49.00</span>
								</div>
								<div className="flex justify-between text-text-soft-400 dark:text-white/40">
									<span>Dedicated IP Add-on</span>
									<span>$15.00</span>
								</div>
							</div>
						</div>

						{/* Action Buttons with Reloop UI FancyButton */}
						<div className="space-y-1.5 pt-0.5">
							<FancyButton.Root
								variant="neutral"
								size="xsmall"
								className="w-full rounded-lg! px-3!"
							>
								<span>Download Receipt (PDF) →</span>
							</FancyButton.Root>
							<span className="flex h-6 w-full items-center justify-center text-[10.5px] text-text-soft-400 hover:text-text-strong-950 dark:text-white/50">
								View in dashboard →
							</span>
						</div>

						{/* Footer Skeletons */}
						<div className="space-y-1 border-stroke-soft-100 border-t pt-2 dark:border-white/5">
							<div className="mx-auto h-1 w-2/3 rounded-full bg-stroke-soft-100 dark:bg-white/10" />
							<div className="mx-auto h-1 w-1/3 rounded-full bg-stroke-soft-100 dark:bg-white/10" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* --- Scene 2: Real-time Collaborative Editor View --- */
type CollaboratorId = "maya" | "noah" | "sarah" | "alex";

interface Collaborator {
	id: CollaboratorId;
	name: string;
	initial: string;
	color: string;
	badgeBg: string;
	textColor: string;
	cursorColor: string;
	highlightBg: string;
}

const COLLABORATORS: Record<CollaboratorId, Collaborator> = {
	maya: {
		id: "maya",
		name: "Maya Chen",
		initial: "M",
		color: "bg-emerald-500 dark:bg-emerald-500",
		badgeBg: "bg-emerald-500",
		textColor: "text-white",
		cursorColor: "bg-emerald-500",
		highlightBg: "bg-emerald-400/20 dark:bg-emerald-400/20",
	},
	noah: {
		id: "noah",
		name: "Noah Patel",
		initial: "N",
		color: "bg-indigo-500 dark:bg-indigo-500",
		badgeBg: "bg-indigo-500",
		textColor: "text-white",
		cursorColor: "bg-indigo-500",
		highlightBg: "bg-indigo-400/20 dark:bg-indigo-400/20",
	},
	sarah: {
		id: "sarah",
		name: "Sarah Jenkins",
		initial: "S",
		color: "bg-amber-400 dark:bg-amber-400",
		badgeBg: "bg-amber-400",
		textColor: "text-black",
		cursorColor: "bg-amber-400",
		highlightBg: "bg-amber-300/30 dark:bg-amber-400/25",
	},
	alex: {
		id: "alex",
		name: "Alex Rivera",
		initial: "A",
		color: "bg-sky-500 dark:bg-sky-400",
		badgeBg: "bg-sky-500",
		textColor: "text-white",
		cursorColor: "bg-sky-500",
		highlightBg: "bg-sky-400/20 dark:bg-sky-400/20",
	},
};

function RealtimeEditorView() {
	const [activeSpotlight, setActiveSpotlight] = useState<CollaboratorId | null>(
		"sarah",
	);
	const [hoveredUser, setHoveredUser] = useState<CollaboratorId | null>(null);

	const isSarahActive = activeSpotlight === "sarah" || hoveredUser === "sarah";
	const isAlexActive = activeSpotlight === "alex" || hoveredUser === "alex";
	const isNoahActive = activeSpotlight === "noah" || hoveredUser === "noah";
	const isMayaActive = activeSpotlight === "maya" || hoveredUser === "maya";

	const toggleSpotlight = (id: CollaboratorId) => {
		setActiveSpotlight((prev) => (prev === id ? null : id));
	};

	return (
		<div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/10 dark:bg-[#0c0c0e]">
			{/* Top Bar with Document Title & 4 Multiplayer Avatars */}
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 dark:border-white/10">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-text-strong-950 text-xs tracking-tight dark:text-white">
						Reloop 2.0: Developer Preview
					</span>
				</div>

				{/* 4 Clickable Avatars with Figma-style Spotlight */}
				<div className="flex items-center gap-2">
					<div className="-space-x-1.5 flex">
						{(["maya", "noah", "sarah", "alex"] as CollaboratorId[]).map(
							(id) => {
								const user = COLLABORATORS[id];
								const isCurrent = activeSpotlight === id;

								return (
									<button
										key={id}
										type="button"
										onClick={() => toggleSpotlight(id)}
										onMouseEnter={() => setHoveredUser(id)}
										onMouseLeave={() => setHoveredUser(null)}
										title={`Click to spotlight ${user.name}`}
										className={cn(
											"relative flex size-6 cursor-pointer items-center justify-center rounded-full font-bold text-[10px] ring-2 transition-all",
											user.color,
											user.textColor,
											isCurrent
												? "scale-110 ring-text-strong-950 ring-offset-2 ring-offset-bg-white-0 dark:ring-white dark:ring-offset-[#0c0c0e]"
												: "ring-white hover:scale-105 dark:ring-[#0c0c0e]",
										)}
									>
										{user.initial}
									</button>
								);
							},
						)}
					</div>

					<div className="flex items-center gap-1 text-[10px] text-text-soft-400 dark:text-white/40">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						<span>4 editing</span>
					</div>
				</div>
			</div>

			{/* Document Header Fields (From, To, Subject) */}
			<div className="space-y-2 border-stroke-soft-100 border-b p-4 text-xs sm:px-6 dark:border-white/5">
				{/* From Row with Alex's Cursor */}
				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							From
						</span>
						<div
							onMouseEnter={() => setHoveredUser("alex")}
							onMouseLeave={() => setHoveredUser(null)}
							className="relative inline-flex items-center font-mono text-[11px] text-text-strong-950 dark:text-white"
						>
							<span>Maya C</span>
							{/* Alex's Cursor */}
							<span className="relative">
								<span
									className={cn(
										"inline-block h-3.5 w-0.5 align-middle transition-colors",
										COLLABORATORS.alex.cursorColor,
									)}
								/>
								{/* Floating Name Tag */}
								<AnimatePresence>
									{isAlexActive && (
										<motion.span
											initial={{ opacity: 0, y: 3, scale: 0.9 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 3, scale: 0.9 }}
											className="-top-5 absolute left-0 z-20 whitespace-nowrap rounded px-1.5 py-0.5 font-bold font-sans text-[9px] text-white shadow-xs"
											style={{ backgroundColor: "#0284c7" }}
										>
											Alex Rivera
										</motion.span>
									)}
								</AnimatePresence>
							</span>
							<span className="text-text-soft-400 dark:text-white/40">
								&lt;maya@updates.reloop.sh&gt;
							</span>
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						Reply-To
					</span>
				</div>

				{/* To Row with Maya's Badge */}
				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							To
						</span>
						<div
							onMouseEnter={() => setHoveredUser("maya")}
							onMouseLeave={() => setHoveredUser(null)}
							className="relative inline-flex items-center"
						>
							<span
								className={cn(
									"rounded px-2 py-0.5 font-mono text-[10.5px] text-text-strong-950 transition-colors dark:text-white",
									isMayaActive
										? "bg-emerald-500/20"
										: "bg-bg-weak-50 dark:bg-white/10",
								)}
							>
								Early Access Developers ×
							</span>
							<AnimatePresence>
								{isMayaActive && (
									<motion.span
										initial={{ opacity: 0, y: 3, scale: 0.9 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 3, scale: 0.9 }}
										className="-top-5 absolute left-0 z-20 whitespace-nowrap rounded px-1.5 py-0.5 font-bold font-sans text-[9px] text-white shadow-xs"
										style={{ backgroundColor: "#10b981" }}
									>
										Maya Chen
									</motion.span>
								)}
							</AnimatePresence>
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						When
					</span>
				</div>

				{/* Subject Row with Sarah's Cursor */}
				<div className="flex items-center justify-between text-text-sub-600 dark:text-white/70">
					<div className="flex items-center gap-3">
						<span className="w-10 text-text-soft-400 dark:text-white/40">
							Subject
						</span>
						<div
							onMouseEnter={() => setHoveredUser("sarah")}
							onMouseLeave={() => setHoveredUser(null)}
							className="relative inline-flex items-center font-medium text-[11.5px] text-text-strong-950 dark:text-white"
						>
							<span>Introducing Reloop 2.0</span>
							{/* Sarah's Cursor */}
							<span className="relative">
								<span
									className={cn(
										"inline-block h-4 w-0.5 align-middle transition-colors",
										COLLABORATORS.sarah.cursorColor,
									)}
								/>
								{/* Floating Name Tag */}
								<AnimatePresence>
									{isSarahActive && (
										<motion.span
											initial={{ opacity: 0, y: 3, scale: 0.9 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 3, scale: 0.9 }}
											className="-top-5 absolute left-0 z-20 whitespace-nowrap rounded px-1.5 py-0.5 font-bold font-sans text-[9px] text-black shadow-xs"
											style={{ backgroundColor: "#facc15" }}
										>
											Sarah Jenkins
										</motion.span>
									)}
								</AnimatePresence>
							</span>
							<span className="text-text-sub-600 dark:text-white/70">
								{" "}
								— Real-time Email Engine
							</span>
						</div>
					</div>
					<span className="text-[10.5px] text-text-soft-400 dark:text-white/40">
						Preview text
					</span>
				</div>
			</div>

			{/* Main Email Content Body */}
			<div className="space-y-3.5 p-5 text-left sm:p-6">
				{/* Greeting with Noah's Cursor & Highlight */}
				<div
					onMouseEnter={() => setHoveredUser("noah")}
					onMouseLeave={() => setHoveredUser(null)}
					className="relative inline-flex items-center text-text-strong-950 text-xs dark:text-white"
				>
					<span>Hey&nbsp;</span>
					<span
						className={cn(
							"cursor-pointer rounded-xs px-1 py-0.5 transition-colors",
							COLLABORATORS.noah.highlightBg,
						)}
					>
						developers
					</span>
					<span>,</span>
					{/* Noah's Cursor */}
					<span className="relative">
						<span
							className={cn(
								"inline-block h-3.5 w-0.5 align-middle transition-colors",
								COLLABORATORS.noah.cursorColor,
							)}
						/>
						{/* Floating Name Tag */}
						<AnimatePresence>
							{isNoahActive && (
								<motion.span
									initial={{ opacity: 0, y: 3, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 3, scale: 0.9 }}
									className="-top-5 absolute left-0 z-20 whitespace-nowrap rounded px-1.5 py-0.5 font-bold font-sans text-[9px] text-white shadow-xs"
									style={{ backgroundColor: "#6366f1" }}
								>
									Noah Patel
								</motion.span>
							)}
						</AnimatePresence>
					</span>
				</div>

				{/* Main Paragraph */}
				<p className="text-[11.5px] text-text-sub-600 leading-relaxed dark:text-white/80">
					Today we're launching the next evolution of transactional and
					marketing email. Build with React Email, track deliverability in
					real-time, and collaborate with your entire team in one unified
					canvas.
				</p>

				{/* Primary Button with Reloop UI FancyButton */}
				<div className="pt-1">
					<FancyButton.Root
						variant="neutral"
						size="xsmall"
						className="rounded-lg! px-3.5!"
					>
						<span>Deploy to Production →</span>
					</FancyButton.Root>
				</div>

				{/* Section Header & Subtitle */}
				<div className="space-y-1.5 border-stroke-soft-100 border-t pt-3 dark:border-white/5">
					<h4 className="font-bold text-sm text-text-strong-950 tracking-tight dark:text-white">
						What's new in Reloop 2.0?
					</h4>
					<p className="text-[11px] text-text-sub-600 leading-relaxed dark:text-white/70">
						Type-safe component primitives, multiplayer canvas editing, and
						automated deliverability monitoring right out of the box.
					</p>
				</div>

				{/* Document Ending Skeletons for Natural Height */}
				<div className="space-y-2 pt-2">
					<div className="flex gap-2">
						<div className="h-2 w-2/5 rounded-full bg-stroke-soft-200 dark:bg-white/10" />
						<div className="h-2 w-1/3 rounded-full bg-stroke-soft-100 dark:bg-white/5" />
						<div className="h-2 w-1/5 rounded-full bg-stroke-soft-200 dark:bg-white/10" />
					</div>
					<div className="flex gap-2">
						<div className="h-2 w-1/2 rounded-full bg-stroke-soft-100 dark:bg-white/5" />
						<div className="h-2 w-2/5 rounded-full bg-stroke-soft-200 dark:bg-white/10" />
					</div>
					<div className="h-2 w-3/5 rounded-full bg-stroke-soft-100 dark:bg-white/5" />
				</div>
			</div>
		</div>
	);
}

/* --- Scene 3: Version History View (Single Focused Widget Block) --- */
function VersionHistoryView() {
	const [showChanges, setShowChanges] = useState(true);
	const [selectedVersion, setSelectedVersion] = useState("v1");

	const VERSIONS = [
		{
			id: "v1",
			time: "11:12:10",
			title: "Button Block was added",
			author: "Maya Chen",
			authorColor: "bg-emerald-500",
			changes: "12 Changes",
			icon: "modules" as const,
		},
		{
			id: "v2",
			time: "11:12:08",
			title: "Subject Line updated",
			author: "Sarah Jenkins",
			authorColor: "bg-amber-400",
			changes: "2 Changes",
			icon: "file-code" as const,
		},
		{
			id: "v3",
			time: "11:12:05",
			title: "Header props modified",
			author: "Alex Rivera",
			authorColor: "bg-sky-500",
			changes: "4 Changes",
			icon: "user" as const,
		},
		{
			id: "v4",
			time: "11:12:02",
			title: "Greeting & Intro tuned",
			author: "Noah Patel",
			authorColor: "bg-indigo-500",
			changes: "6 Changes",
			icon: "sparkling" as const,
		},
		{
			id: "v5",
			time: "11:11:59",
			title: "Template scaffold created",
			author: "Maya Chen",
			authorColor: "bg-emerald-500",
			changes: "Initial",
			icon: "layout" as const,
		},
	];

	return (
		<div className="relative mx-auto w-full max-w-xl">
			{/* Top Bar with Logo & Restore Button */}
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 shadow-2xs dark:border-white/10 dark:bg-white/5">
						<Icon
							name="sparkling"
							className="size-3.5 text-text-strong-950 dark:text-white"
						/>
					</div>
					<button
						type="button"
						className="flex size-7 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-2xs transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
					>
						<span className="text-xs">←</span>
					</button>
				</div>

				{/* Signature Reloop UI FancyButton Root */}
				<FancyButton.Root
					variant="neutral"
					size="xsmall"
					className="rounded-full! px-3.5!"
				>
					<Icon name="history" className="size-3" />
					<span>Restore this version</span>
				</FancyButton.Root>
			</div>

			{/* Main Single Block: Version History Widget */}
			<div className="relative overflow-visible rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm dark:border-white/10 dark:bg-[#0c0c0e]">
				{/* Card Header */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-5 py-3 dark:border-white/10">
					<h3 className="font-medium text-text-strong-950 text-xs tracking-tight dark:text-white">
						Version History
					</h3>
					<span className="text-text-soft-400 text-xs dark:text-white/40">
						🔍
					</span>
				</div>

				{/* Timeline Content */}
				<div className="relative p-4 sm:p-5">
					<div className="mb-2 font-normal text-[11px] text-text-soft-400 dark:text-white/40">
						Today
					</div>

					{/* Vertical Timeline Rail & Items */}
					<div className="relative space-y-1.5">
						{/* Vertical Connecting Line */}
						<div className="absolute top-3 bottom-3 left-[15px] w-px bg-stroke-soft-200 dark:bg-white/10" />

						{VERSIONS.map((v) => {
							const isSelected = selectedVersion === v.id;

							return (
								<div key={v.id} className="relative flex items-center gap-3">
									{/* Timeline Icon Node */}
									<div
										className={cn(
											"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs transition-colors",
											isSelected
												? "border-stroke-soft-300 bg-bg-weak-50 text-text-strong-950 dark:border-white/20 dark:bg-white/10 dark:text-white"
												: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-[#121215] dark:text-white/60",
										)}
									>
										<Icon name={v.icon} className="size-3.5" />
									</div>

									{/* Snapshot Card */}
									<div
										onClick={() => setSelectedVersion(v.id)}
										className={cn(
											"group flex flex-1 cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all",
											isSelected
												? "border-stroke-soft-200 bg-bg-weak-50/60 shadow-2xs dark:border-white/10 dark:bg-white/[0.02]"
												: "border-transparent bg-transparent hover:border-stroke-soft-200 hover:bg-bg-weak-50/50 dark:hover:border-white/10 dark:hover:bg-white/[0.02]",
										)}
									>
										<div className="space-y-0.5">
											<div className="flex items-center gap-2">
												<span className="font-mono text-[10.5px] text-text-soft-400 dark:text-white/40">
													{v.time}
												</span>
												<span className="font-normal text-text-strong-950 text-xs dark:text-white">
													{v.title}
												</span>
											</div>
											<div className="flex items-center gap-1.5 text-[10.5px]">
												<span
													className={cn("size-1.5 rounded-full", v.authorColor)}
												/>
												<span className="text-text-sub-600 dark:text-white/60">
													{v.author}
												</span>
												<span className="text-text-soft-400 dark:text-white/30">
													·
												</span>
												<span className="text-text-soft-400 dark:text-white/50">
													{v.changes} {isSelected && "▾"}
												</span>
											</div>
										</div>

										<span className="text-text-soft-400 text-xs opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/40">
											•••
										</span>
									</div>
								</div>
							);
						})}

						{/* Floating Action Menu Popover */}
						<div className="-right-4 absolute top-2 z-30 hidden w-44 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1.5 shadow-xl sm:block dark:border-white/15 dark:bg-[#151518]">
							<div className="space-y-0.5 text-[11px]">
								<FancyButton.Root
									variant="neutral"
									size="xsmall"
									className="w-full justify-start rounded-lg! px-2.5! font-normal"
								>
									<Icon name="history" className="size-3" />
									<span>Restore</span>
								</FancyButton.Root>
								{[
									{ label: "Restore as new", badge: "Soon" },
									{ label: "Preview snapshot", badge: "Soon" },
									{ label: "Add a Name", badge: "Soon" },
									{ label: "Add a Tag", badge: "Soon" },
									{ label: "Export React Email", badge: "Soon" },
								].map((item) => (
									<div
										key={item.label}
										className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 font-normal text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
									>
										<span>{item.label}</span>
										<span className="rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.2 font-medium text-[8.5px] text-text-soft-400 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
											{item.badge}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Card Footer with Reloop UI Switch */}
				<div className="flex items-center justify-between border-stroke-soft-100 border-t px-5 py-3 dark:border-white/10">
					<span className="font-medium text-text-sub-600 text-xs dark:text-white/70">
						Show Changes
					</span>
					<Switch.Root checked={showChanges} onCheckedChange={setShowChanges} />
				</div>
			</div>
		</div>
	);
}

/* --- Main PreviewStage Component --- */
export function PreviewStage() {
	const shouldReduceMotion = useReducedMotion();
	const [active, setActive] = useState<TemplateTabId>("ai-templates");
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
		<div className="bg-bg-white-0 dark:bg-black">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto h-[29rem] max-w-5xl px-5 pt-6 sm:h-[32rem] sm:px-8 sm:pt-7 lg:h-[34rem] lg:px-10 lg:pt-8">
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
							{active === "ai-templates" ? (
								<AiTemplatesView />
							) : active === "realtime-editor" ? (
								<RealtimeEditorView />
							) : (
								<VersionHistoryView />
							)}
						</motion.div>
					</AnimatePresence>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-15% from-[#fbfbfb] via-[#fbfbfb]/80 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/80"
				/>
			</div>
			<PreviewTabs active={active} onChange={handleTabChange} />
		</div>
	);
}
