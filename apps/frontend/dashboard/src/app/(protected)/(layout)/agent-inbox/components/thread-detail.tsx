"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
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
				<div className="flex items-start justify-between gap-4 px-6 py-4">
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

							{/* To block */}
							<div className="mt-0.5 flex items-center gap-1 text-text-soft-400 text-xs">
								<span>to me</span>
								<Icon name="chevron-down" className="h-3 w-3" />
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
								onClick={() => handlePrototypeAction("Add reaction")}
								className="rounded-lg p-1.5 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
								title="Add reaction"
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
									<circle cx="12" cy="12" r="10" />
									<path d="M8 14s1.5 2 4 2 4-2 4-2" />
									<line x1="9" y1="9" x2="9.01" y2="9" />
									<line x1="15" y1="9" x2="15.01" y2="9" />
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
							<button
								type="button"
								onClick={() => handlePrototypeAction("More actions")}
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
						</div>
					</div>
				</div>

				<div className="px-5 py-4">
					<SectionTitle>Message</SectionTitle>
					<p className="whitespace-pre-wrap text-label-sm text-text-strong-950 leading-relaxed">
						{thread.bodyText}
					</p>
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
