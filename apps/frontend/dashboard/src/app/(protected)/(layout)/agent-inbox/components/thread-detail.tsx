"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import * as Dropdown from "@reloop/ui/dropdown";
import type { AgentMailbox, InboundThread } from "../mock-data";

dayjs.extend(relativeTime);

interface ThreadDetailProps {
	thread: InboundThread | null;
	mailbox: AgentMailbox | undefined;
	onBack?: () => void;
	showBack?: boolean;
}

const _MetaRow = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<div className="flex gap-2 text-label-sm">
		<span className="w-16 shrink-0 text-text-soft-400">{label}</span>
		<span className="min-w-0 text-text-sub-600">{children}</span>
	</div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
	<h3 className="mb-3 font-medium text-label-sm text-text-sub-600">
		{children}
	</h3>
);

export const ThreadDetail = ({
	thread,
	mailbox,
	onBack,
	showBack,
}: ThreadDetailProps) => {
	const [parsedExpanded, setParsedExpanded] = useState(true);

	if (!thread) {
		return (
			<div className="flex min-h-[500px] flex-col items-center justify-center gap-1 p-8 text-center">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
					<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
				</div>
				<h3 className="font-semibold text-base text-text-strong-950">
					Select a message to inspect
				</h3>
				<p className="mx-auto max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
					Click any message on the left to review parsing, timeline, and
					approval actions.
				</p>
				<div className="mt-4 flex items-center gap-1.5 text-text-soft-400 text-xs">
					<Icon name="arrow-left" className="h-3.5 w-3.5" />
					<span className="font-medium">Pick a message to get started</span>
				</div>
			</div>
		);
	}

	const handlePrototypeAction = (action: string) => {
		toast.info(`${action} — prototype only`);
	};

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="min-h-0 flex-1 overflow-y-auto">
				{/* Subject Header */}
				<div className="border-stroke-soft-100 border-b px-6 py-5 dark:border-stroke-soft-100/40">
					<h1 className="flex items-center gap-2 font-medium text-text-strong-950 text-xl">
						{thread.subject}
					</h1>
				</div>

				{/* Sender Meta Row */}
				<div className="flex items-start justify-between gap-4 px-6 pt-4 pb-2">
					{/* Left side: Avatar + Sender Info */}
					<div className="flex min-w-0 items-start gap-3">
						{/* Avatar Circle */}
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-base/20 bg-primary-base/10 font-semibold text-primary-base text-sm">
							{thread.from.name
								? thread.from.name.charAt(0).toUpperCase()
								: thread.from.email.charAt(0).toUpperCase() || "?"}
						</div>

						<div className="flex min-w-0 flex-col">
							{/* Name <email> and Unsubscribe */}
							<div className="flex flex-wrap items-baseline gap-1.5">
								<span className="font-semibold text-label-sm text-text-strong-950">
									{thread.from.name || thread.from.email.split("@")[0]}
								</span>
								<span className="font-normal text-text-soft-400 text-xs">
									&lt;{thread.from.email}&gt;
								</span>
								<button
									type="button"
									onClick={() => handlePrototypeAction("Unsubscribe")}
									className="ml-1 font-medium text-primary-base text-xs hover:underline"
								>
									Unsubscribe
								</button>
							</div>

							{/* To block with hover details */}
							<div className="group/tome relative mt-0.5 inline-flex items-center gap-1 text-text-soft-400 text-xs cursor-pointer">
								<span>to me</span>
								<Icon name="chevron-down" className="h-3 w-3" />

								{/* Hover Detail Card */}
								<div className="absolute top-full left-0 mt-1.5 z-30 w-80 rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/30 bg-bg-white-0 dark:bg-neutral-900 p-3 shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tome:opacity-100 group-hover/tome:scale-100 group-hover/tome:pointer-events-auto transition-all duration-150 origin-top-left text-text-sub-600 dark:text-text-sub-400 flex flex-col gap-2">
									<div className="grid grid-cols-[50px_minmax(0,1fr)] gap-x-2 gap-y-1.5 font-normal text-xs leading-relaxed">
										<span className="text-text-soft-400 text-right">from:</span>
										<span className="truncate text-text-strong-950 font-medium dark:text-white">
											{thread.from.name ? `${thread.from.name} <${thread.from.email}>` : thread.from.email}
										</span>

										<span className="text-text-soft-400 text-right">to:</span>
										<span className="truncate text-text-strong-950 font-medium dark:text-white">
											{mailbox?.email || "me"}
										</span>

										<span className="text-text-soft-400 text-right">date:</span>
										<span className="text-text-strong-950 font-medium dark:text-white">
											{dayjs(thread.receivedAt).format("ddd, MMM D, YYYY [at] h:mm A")}
										</span>

										<span className="text-text-soft-400 text-right">subject:</span>
										<span className="text-text-strong-950 font-medium dark:text-white break-words">
											{thread.subject}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right side: Date + Action Icons */}
					<div className="flex shrink-0 items-center gap-2">
						<span className="text-text-soft-400 text-xs">
							{dayjs(thread.receivedAt).format("ddd, MMM D, h:mm A")} (
							{dayjs(thread.receivedAt).fromNow()})
						</span>

						<div className="flex items-center gap-0.5 text-text-soft-400">
							<button
								type="button"
								onClick={() => handlePrototypeAction("Star message")}
								className="rounded-lg p-1.5 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
								title="Star message"
							>
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
							</button>

							<button
								type="button"
								onClick={() => handlePrototypeAction("Reply")}
								className="rounded-lg p-1.5 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
								title="Reply"
							>
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<polyline points="9 17 4 12 9 7" />
									<path d="M20 18v-2a4 4 0 0 0-4-4H4" />
								</svg>
							</button>
							<Dropdown.Root>
								<Dropdown.Trigger asChild>
									<button
										type="button"
										className="rounded-lg p-1.5 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
										title="More actions"
									>
										<svg
											className="h-4 w-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<circle cx="12" cy="12" r="1" />
											<circle cx="12" cy="5" r="1" />
											<circle cx="12" cy="19" r="1" />
										</svg>
									</button>
								</Dropdown.Trigger>
								<Dropdown.Content align="end" className="w-56 rounded-xl p-1.5 bg-bg-white-0 dark:bg-neutral-900 border border-stroke-soft-100 dark:border-stroke-soft-100/30 shadow-lg">
									<Dropdown.Item
										onClick={() => handlePrototypeAction("Reply")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="9 17 4 12 9 7" />
											<path d="M20 18v-2a4 4 0 0 0-4-4H4" />
										</svg>
										<span>Reply</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Forward")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="15 17 20 12 15 7" />
											<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
										</svg>
										<span>Forward</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Delete")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-error-base hover:bg-red-50/50 dark:hover:bg-red-950/20 text-xs transition-colors"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
											<line x1="10" y1="11" x2="10" y2="17" />
											<line x1="14" y1="11" x2="14" y2="17" />
										</svg>
										<span>Delete</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Mark as unread")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
											<polyline points="22,6 12,13 2,6" />
										</svg>
										<span>Mark as unread</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={() => handlePrototypeAction(`Block "${thread.from.name || thread.from.email.split("@")[0]}"`)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10" />
											<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
										</svg>
										<span className="truncate">Block "{thread.from.name || thread.from.email.split("@")[0]}"</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Report spam")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
											<line x1="12" y1="8" x2="12" y2="12" />
											<line x1="12" y1="16" x2="12.01" y2="16" />
										</svg>
										<span>Report spam</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Report phishing")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
											<line x1="12" y1="8" x2="12" y2="12" />
											<line x1="12" y1="16" x2="12.01" y2="16" />
										</svg>
										<span>Report phishing</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Filter messages like this")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<line x1="4" y1="21" x2="4" y2="14" />
											<line x1="4" y1="10" x2="4" y2="3" />
											<line x1="12" y1="21" x2="12" y2="12" />
											<line x1="12" y1="8" x2="12" y2="3" />
											<line x1="20" y1="21" x2="20" y2="16" />
											<line x1="20" y1="12" x2="20" y2="3" />
											<line x1="1" y1="14" x2="7" y2="14" />
											<line x1="9" y1="8" x2="15" y2="8" />
											<line x1="17" y1="16" x2="23" y2="16" />
										</svg>
										<span>Filter messages</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Translate")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10" />
											<line x1="2" y1="12" x2="22" y2="12" />
											<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
										</svg>
										<span>Translate message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Print")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="6 9 6 2 18 2 18 9" />
											<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
											<rect x="6" y="14" width="12" height="8" />
										</svg>
										<span>Print</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Download")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="7 10 12 15 17 10" />
											<line x1="12" y1="15" x2="12" y2="3" />
										</svg>
										<span>Download message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handlePrototypeAction("Show original")}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 hover:bg-bg-weak-50 dark:hover:bg-zinc-800 text-xs transition-colors dark:text-white"
									>
										<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="16 18 22 12 16 6" />
											<polyline points="8 6 2 12 8 18" />
										</svg>
										<span>Show original</span>
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>
						</div>
					</div>
				</div>

				<div className="px-5 pt-0 pb-4">
					{thread.bodyHtml ? (
						<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/30">
							<iframe
								srcDoc={`
									<!DOCTYPE html>
									<html>
									<head>
										<meta charset="utf-8">
										<style>
											body {
												font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
												font-size: 14px;
												line-height: 1.5;
												color: #1c1917;
												margin: 0;
												padding: 16px;
												background-color: #ffffff;
											}
											img {
												max-width: 100%;
												height: auto;
											}
										</style>
									</head>
									<body>
										${thread.bodyHtml}
									</body>
									</html>
								`}
								sandbox="allow-popups allow-popups-to-escape-sandbox"
								className="w-full min-h-[450px] border-0 bg-white"
								title="Email HTML body"
							/>
						</div>
					) : (
						<p className="whitespace-pre-wrap text-label-sm text-text-strong-950 leading-relaxed">
							{thread.bodyText}
						</p>
					)}
				</div>

				{thread.attachments && thread.attachments.length > 0 && (
					<div className="border-stroke-soft-100 border-t px-5 py-4 dark:border-stroke-soft-100/40">
						<SectionTitle>Attachments</SectionTitle>
						<ul className="flex flex-col gap-2">
							{thread.attachments.map((file) => (
								<li key={file.name}>
									<button
										type="button"
										onClick={() =>
											handlePrototypeAction(`Download ${file.name}`)
										}
										className="flex w-full items-center gap-3 rounded-lg border border-stroke-soft-100 px-3 py-2 text-left transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40"
									>
										<Icon
											name="file-text"
											className="h-4 w-4 shrink-0 text-text-sub-600"
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate text-label-sm text-text-strong-950">
												{file.name}
											</p>
											<p className="text-label-xs text-text-soft-400">
												{file.size}
											</p>
										</div>
										<Icon
											name="file-download"
											className="h-4 w-4 text-text-soft-400"
										/>
									</button>
								</li>
							))}
						</ul>
					</div>
				)}

				{thread.parsed && Object.keys(thread.parsed).length > 0 && (
					<div className="border-stroke-soft-100 border-t px-5 py-4 dark:border-stroke-soft-100/40">
						<button
							type="button"
							onClick={() => setParsedExpanded((v) => !v)}
							className="mb-3 flex w-full items-center justify-between text-left"
						>
							<span className="font-medium text-label-sm text-text-sub-600">
								Parsed data
							</span>
							<Icon
								name="chevron-down"
								className={cn(
									"h-4 w-4 text-text-sub-600 transition-transform",
									parsedExpanded && "rotate-180",
								)}
							/>
						</button>
						{parsedExpanded && (
							<div className="flex flex-col gap-2 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-3 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
								{Object.entries(thread.parsed).map(([key, value]) => (
									<div
										key={key}
										className="grid grid-cols-[minmax(0,120px)_1fr] gap-2 text-label-sm"
									>
										<span className="font-medium text-text-soft-400 capitalize">
											{key.replace(/([A-Z])/g, " $1").trim()}
										</span>
										<span className="break-words text-text-strong-950">
											{typeof value === "object"
												? JSON.stringify(value)
												: String(value)}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
