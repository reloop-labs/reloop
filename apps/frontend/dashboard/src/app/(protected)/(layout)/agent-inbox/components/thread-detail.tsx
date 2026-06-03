"use client";

import type { ReactNode } from "react";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { toast } from "sonner";
import type { AgentMailbox, InboundThread } from "../mock-data";
import { SECURITY_LEVEL_LABELS } from "../mock-data";

dayjs.extend(relativeTime);

interface ThreadDetailProps {
	thread: InboundThread | null;
	mailbox: AgentMailbox | undefined;
	onBack?: () => void;
	showBack?: boolean;
}

const MetaRow = ({
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
		<div className="flex min-h-[500px] flex-col">
			<div className="flex-1 overflow-y-auto">
				{showBack && onBack && (
					<div className="border-stroke-soft-100 border-b px-4 py-2 lg:hidden dark:border-stroke-soft-100/40">
						<button
							type="button"
							onClick={onBack}
							className="flex items-center gap-1 text-label-sm text-text-sub-600 hover:text-text-strong-950"
						>
							<Icon name="arrow-left" className="h-4 w-4" />
							Back to list
						</button>
					</div>
				)}

				<div className="border-stroke-soft-100 border-b px-5 py-4 dark:border-stroke-soft-100/40">
					<h2 className="font-semibold text-base text-text-strong-950">
						{thread.subject}
					</h2>
					<div className="mt-3 flex flex-col gap-1.5">
						<MetaRow label="From">
							{thread.from.name ? (
								<>
									{thread.from.name}{" "}
									<span className="text-text-soft-400">
										&lt;{thread.from.email}&gt;
									</span>
								</>
							) : (
								thread.from.email
							)}
						</MetaRow>
						<MetaRow label="To">{mailbox?.email ?? "—"}</MetaRow>
						<MetaRow label="Received">
							{dayjs(thread.receivedAt).format("MMM D, YYYY h:mm A")} (
							{dayjs(thread.receivedAt).fromNow()})
						</MetaRow>
						<MetaRow label="Security">
							{SECURITY_LEVEL_LABELS[thread.securityLevel]}
						</MetaRow>
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

				<div className="border-stroke-soft-100 border-t px-5 py-4 dark:border-stroke-soft-100/40">
					<SectionTitle>Processing timeline</SectionTitle>
					<ol className="flex flex-col">
						{thread.timeline.map((step, index) => (
							<li key={step.label} className="flex gap-3">
								<div className="flex flex-col items-center">
									<div
										className={cn(
											"flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
											step.state === "done" &&
												"bg-success-light text-success-dark",
											step.state === "active" &&
												"bg-primary-alpha-10 text-primary-base ring-1 ring-primary-base/30",
											step.state === "pending" &&
												"border border-stroke-soft-200 bg-bg-white-0",
										)}
									>
										{step.state === "done" && (
											<Icon name="check" className="h-3 w-3" />
										)}
										{step.state === "active" && (
											<span className="h-1.5 w-1.5 rounded-full bg-primary-base" />
										)}
									</div>
									{index < thread.timeline.length - 1 && (
										<div className="my-0.5 min-h-[16px] w-px flex-1 bg-stroke-soft-200" />
									)}
								</div>
								<div className="pb-3">
									<p className="text-label-sm font-medium text-text-strong-950">
										{step.label}
									</p>
									{step.at && (
										<p className="text-label-xs text-text-soft-400">
											{dayjs(step.at).format("MMM D, h:mm A")}
										</p>
									)}
								</div>
							</li>
						))}
					</ol>
				</div>
			</div>

			<div className="shrink-0 border-stroke-soft-100 border-t px-4 py-3 dark:border-stroke-soft-100/40">
				<div className="flex flex-wrap items-center gap-2">
					{thread.status === "needs_approval" ? (
						<Button.Root
							variant="primary"
							size="xsmall"
							onClick={() => handlePrototypeAction("Approve & send")}
							className="gap-1.5"
						>
							<Icon name="check-circle" className="h-4 w-4" />
							Approve & send
						</Button.Root>
					) : (
						<Button.Root
							variant="primary"
							size="xsmall"
							onClick={() => handlePrototypeAction("Run agent")}
							className="gap-1.5"
						>
							<Icon name="sparkling" className="h-4 w-4" />
							Run agent
						</Button.Root>
					)}
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => handlePrototypeAction("Mark handled")}
					>
						Mark handled
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xsmall"
						onClick={() => handlePrototypeAction("Block sender")}
					>
						Block sender
					</Button.Root>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xsmall"
						onClick={() => handlePrototypeAction("View raw webhook")}
					>
						View raw webhook
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
