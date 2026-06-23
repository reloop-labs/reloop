"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { ArrowRight, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import useSWR from "swr";

interface EmailLogData {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
}

interface EmailListResponse {
	object: "list";
	data: EmailLogData[];
	total: number;
	page: number;
	limit: number;
}

interface BackendMessage {
	id: string;
	mailboxId: string;
	fromEmail: string;
	fromName: string | null;
	subject: string | null;
	status: string;
	createdAt: string | Date;
}

const getEmailIcon = (status: string) => {
	switch (status?.toLowerCase()) {
		case "sent":
			return "send";
		case "delivered":
			return "check-circle";
		case "opened":
			return "eye-outline";
		case "clicked":
			return "cursor-click";
		case "received":
			return "mail-receive";
		case "spam":
			return "alert-triangle";
		default:
			return "mail-send";
	}
};

const getEmailIconColorClass = (status: string) => {
	switch (status?.toLowerCase()) {
		case "sent":
			return "text-blue-500 dark:text-blue-400";
		case "delivered":
			return "text-green-500 dark:text-green-400";
		case "opened":
		case "clicked":
			return "text-text-sub-600 dark:text-white/40";
		case "received":
			return "text-blue-500 dark:text-blue-400";
		case "spam":
			return "text-error-base";
		default:
			return "text-text-sub-600 dark:text-white/40";
	}
};

const formatShortRelativeTime = (date: string | Date) => {
	const now = new Date();
	const diffMs = now.getTime() - new Date(date).getTime();
	const diffSec = Math.max(0, Math.floor(diffMs / 1000));
	const diffMin = Math.floor(diffSec / 60);
	const diffHr = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHr / 24);

	if (diffSec < 30) {
		return "just now";
	}
	if (diffMin < 60) {
		return `${diffMin}m ago`;
	}
	if (diffHr < 24) {
		return `${diffHr}h ago`;
	}
	return `${diffDay}d ago`;
};

export function EmailsCard() {
	const { activeOrganization } = useUserOrganization();
	const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const tabItems = [
		{ title: "Sent", value: "sent" as const, iconName: "mail-send" },
		{ title: "Received", value: "received" as const, iconName: "mail-receive" },
	];

	const activeIndex = tabItems.findIndex((item) => item.value === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	// Fetch Sent logs
	const { data: emailLogsData } = useSWR<EmailListResponse>(
		activeOrganization?.id ? "/api/logs/v1/emails?limit=10&page=1" : null,
	);

	// Fetch Received logs
	const { data: messagesData } = useSWR<BackendMessage[]>(
		activeOrganization?.id ? "/api/inbox/v1/messages" : null,
	);

	const headerHref = activeTab === "sent" ? "/emails" : "/agent-inbox";

	const hasSentLogs = emailLogsData?.data && emailLogsData.data.length > 0;
	const hasReceivedMessages = messagesData && messagesData.length > 0;

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href={headerHref}
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="mail-single" className="h-4 w-4 shrink-0" />
					<span>Emails</span>
				</Link>

				<div className="flex items-center gap-1.5">
					{activeTab === "received" && (
						<Link
							href="/agent-inbox/create"
							className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
						>
							<Plus className="h-3.5 w-3.5" />
						</Link>
					)}
					<Link
						href={headerHref}
						className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>

			{/* Body Container */}
			<div className="-mt-1.5 flex h-[250px] flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				{/* Tab Selector */}
				<div className="flex shrink-0 border-stroke-soft-100/50 border-b dark:border-white/5">
					<TabMenuHorizontal.Root
						defaultValue="sent"
						value={activeTab}
						className="w-full"
					>
						<TabMenuHorizontal.List className="relative h-10 w-full justify-start gap-0 border-b-0 py-0">
							{tabItems.map(({ value, title, iconName }, index) => (
								<TabMenuHorizontal.Trigger
									ref={(el) => {
										if (el) {
											buttonRefs.current[index] = el;
										}
									}}
									onPointerEnter={() => setHoveredIdx(index)}
									onPointerLeave={() => setHoveredIdx(undefined)}
									className={cn(
										"flex h-12 cursor-pointer items-center gap-2 px-3.5 py-0! font-medium text-xs",
										hoveredIdx === undefined &&
											activeIndex === index &&
											"text-text-strong-950 dark:text-white",
									)}
									key={value}
									value={value}
									onClick={() => setActiveTab(value)}
								>
									<Icon name={iconName} className="h-3.5 w-3.5" />
									{title}
								</TabMenuHorizontal.Trigger>
							))}
							<AnimatePresence>
								{rect && activeIndex !== -1 ? (
									<motion.div
										className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10 dark:bg-white/10"
										initial={{
											pointerEvents: "none",
											width: rect.width,
											height: rect.height - 20,
											left:
												rect.left -
												(tab?.offsetParent?.getBoundingClientRect().left || 0),
											top:
												rect.top -
												(tab?.offsetParent?.getBoundingClientRect().top || 0) +
												10,
											opacity: 0,
										}}
										animate={{
											pointerEvents: "none",
											width: rect.width,
											height: rect.height - 20,
											left:
												rect.left -
												(tab?.offsetParent?.getBoundingClientRect().left || 0),
											top:
												rect.top -
												(tab?.offsetParent?.getBoundingClientRect().top || 0) +
												10,
											opacity: 1,
										}}
										exit={{
											pointerEvents: "none",
											opacity: 0,
											width: rect.width,
											height: rect.height - 20,
											left:
												rect.left -
												(tab?.offsetParent?.getBoundingClientRect().left || 0),
											top:
												rect.top -
												(tab?.offsetParent?.getBoundingClientRect().top || 0) +
												10,
										}}
										transition={{ duration: 0.14 }}
									/>
								) : null}
							</AnimatePresence>
						</TabMenuHorizontal.List>
					</TabMenuHorizontal.Root>
				</div>

				{/* List or Empty State */}
				<div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
					{activeTab === "sent" ? (
						hasSentLogs ? (
							<div>
								{emailLogsData.data.slice(0, 6).map((d) => (
									<Link
										key={d.id}
										href={`/emails/${d.id}`}
										className="group/row flex items-center justify-between border-stroke-soft-100 border-b py-2.5 transition-colors last:border-b-0 hover:bg-bg-weak-50/50 dark:border-white/5 dark:hover:bg-white/[0.01]"
									>
										<div className="flex min-w-0 flex-1 items-center gap-3">
											<span title={d.status} className="shrink-0">
												<Icon
													name={getEmailIcon(d.status)}
													className={cn(
														"h-4 w-4",
														getEmailIconColorClass(d.status),
													)}
												/>
											</span>
											<span className="truncate font-semibold text-text-strong-950 text-xs group-hover/row:underline dark:text-white">
												{d.toEmails?.[0] || d.fromEmail || "(No Recipient)"}
											</span>
										</div>
										<span className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
											{formatShortRelativeTime(d.createdAt)}
										</span>
									</Link>
								))}
							</div>
						) : (
							<div className="flex h-full flex-col items-center justify-center px-6 py-4 text-center">
								<Icon
									name="mail-send"
									className="h-6 w-6 shrink-0 text-text-sub-600 dark:text-white/40"
								/>
								<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									Send emails without the overhead
								</h4>
								<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									Send transactional & marketing emails with high
									deliverability.
								</p>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									asChild
									className="mt-6 shrink-0 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
								>
									<Link href="/api-keys">View API keys</Link>
								</Button.Root>
							</div>
						)
					) : hasReceivedMessages ? (
						<div>
							{messagesData.slice(0, 6).map((d) => (
								<Link
									key={d.id}
									href={`/agent-inbox/${d.mailboxId}`}
									className="group/row flex items-center justify-between border-stroke-soft-100 border-b py-2.5 transition-colors last:border-b-0 hover:bg-bg-weak-50/50 dark:border-white/5 dark:hover:bg-white/[0.01]"
								>
									<div className="flex min-w-0 flex-1 items-center gap-3">
										<span title={d.status} className="shrink-0">
											<Icon
												name={getEmailIcon(d.status)}
												className={cn(
													"h-4 w-4",
													getEmailIconColorClass(d.status),
												)}
											/>
										</span>
										<span className="truncate font-semibold text-text-strong-950 text-xs group-hover/row:underline dark:text-white">
											{d.fromEmail || d.fromName || "(Unknown)"}
										</span>
									</div>
									<span className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
										{formatShortRelativeTime(d.createdAt)}
									</span>
								</Link>
							))}
						</div>
					) : (
						<div className="flex h-full flex-col items-center justify-center px-6 py-4 text-center">
							<Icon
								name="mail-receive"
								className="h-6 w-6 shrink-0 text-text-sub-600 dark:text-white/40"
							/>
							<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								No emails received yet
							</h4>
							<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								Configure your agent inboxes to start receiving incoming emails.
							</p>
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								asChild
								className="mt-6 shrink-0 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
							>
								<Link href="/agent-inbox/create">Set up inbox</Link>
							</Button.Root>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
