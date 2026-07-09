"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import {
	Forward,
	MoreHorizontal,
	Reply,
	ReplyAll,
} from "lucide-react";
import { useState } from "react";
import type { AgentMailbox } from "../../types";
import { formatMessageTimestamp, formatZeroMessageTime } from "./date-utils";
import { MessageAttachments } from "./message-attachments";
import { MessageBody } from "./message-body";
import { MessageDraftActions } from "./message-draft-actions";
import { MessageDraftBanner } from "./message-draft-banner";
import { MessageParsedData } from "./message-parsed-data";
import { MessageSentBanner } from "./message-sent-banner";

const cleanName = (name?: string | null) =>
	(name ?? "").replace(/["<>]/g, "") || "Unknown";

const ActionButton = ({
	onClick,
	icon,
	text,
}: {
	onClick: (e: React.MouseEvent) => void;
	icon: React.ReactNode;
	text: string;
}) => (
	<button
		type="button"
		onClick={onClick}
		className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-md border border-mail-border bg-white px-1.5 transition-colors hover:bg-gray-100 dark:border-none dark:bg-[#313131] dark:hover:bg-[#3d3d3d]"
	>
		{icon}
		<span className="justify-start pr-1 pl-0.5 text-mail-foreground text-sm leading-none">
			{text}
		</span>
	</button>
);

export const ZeroMailDisplay = ({
	msg,
	mailbox,
	index,
	totalCount,
	isTranslated,
	targetLanguage,
	translatedHtmlMap,
	translatedTextMap,
	parsedExpanded,
	onToggleParsed,
	onReply,
	onReplyAll,
	onForward,
	onDelete,
	onPrint,
	onApproveSend,
	onEditReply,
}: {
	msg: any;
	mailbox: AgentMailbox | undefined;
	index: number;
	totalCount: number;
	isTranslated: boolean;
	targetLanguage: string;
	translatedHtmlMap: Record<string, string>;
	translatedTextMap: Record<string, string>;
	parsedExpanded: boolean;
	onToggleParsed: () => void;
	onReply: () => void;
	onReplyAll?: () => void;
	onForward: () => void;
	onDelete: () => void;
	onPrint: () => void;
	onApproveSend?: () => void;
	onEditReply?: () => void;
}) => {
	const isLast = index === totalCount - 1;
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(!isLast);

	const isOutbound = msg.direction === "outbound";
	const isApproval = msg.status === "needs_approval";
	const isAgent =
		msg.direction === "agent" ||
		Boolean(msg.isAgent) ||
		msg.fromEmail?.includes("agent");

	const email = msg.email;
	const senderName = isOutbound
		? "You"
		: cleanName(msg.fromName) ||
			(msg.fromEmail ? msg.fromEmail.split("@")[0] : "Unknown");
	const senderEmail = msg.fromEmail || "";

	const key = `${msg.id}-${targetLanguage}`;
	const bodyHtml = isTranslated
		? translatedHtmlMap[key] || "Translating..."
		: email?.htmlBody || msg.htmlBody;
	const bodyText = isTranslated
		? translatedTextMap[key] || "Translating..."
		: email?.textBody || msg.textBody;

	const toEmails: string[] =
		email?.toEmails || msg.toEmails || (mailbox?.email ? [mailbox.email] : []);
	const toLabel =
		toEmails.length === 1 && toEmails[0] === mailbox?.email
			? "You"
			: toEmails.join(", ");

	const displayAttachments = (email?.attachments || msg.attachments || []).map(
		(att: any) => ({
			id: att.id,
			name: att.filename || att.name || "Attachment",
			size:
				typeof att.size === "number"
					? `${(att.size / 1024).toFixed(1)} KB`
					: att.size || "Unknown size",
			contentType: att.contentType,
			isInline: att.isInline,
			inboundEmailId: att.inboundEmailId || email?.id || msg.inboundEmailId,
			messageId: email?.id || msg.inboundEmailId || msg.id,
			...att,
		}),
	);

	const toggleCollapse = () => {
		if (isLast) return;
		setIsCollapsed((v) => !v);
	};

	return (
		<div
			className={cn(
				"relative flex-1",
				index > 0 && "border-mail-border border-t",
			)}
		>
			<div
				className="flex cursor-pointer flex-col pb-2 duration-200"
				onClick={toggleCollapse}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						toggleCollapse();
					}
				}}
				role={isLast ? undefined : "button"}
				tabIndex={isLast ? undefined : 0}
			>
				<div className="mt-3 flex w-full items-start justify-between gap-4 px-4">
					<div className="flex w-full gap-4">
						<div
							className={cn(
								"mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase",
								getAvatarGradient(senderEmail || senderName),
							)}
						>
							{getAvatarInitial(msg.fromName ?? null, senderEmail || senderName)}
						</div>

						<div className="flex w-full items-center justify-between gap-2">
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-semibold text-mail-foreground text-sm">
										{senderName}
									</span>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setDetailsOpen((v) => !v);
										}}
										className="text-[#8C8C8C] text-xs underline"
									>
										Details
									</button>
								</div>
								{!isCollapsed && (
									<p className="mt-0.5 text-[#8C8C8C] text-sm">
										To: {toLabel}
									</p>
								)}
								{isCollapsed && (
									<p className="mt-0.5 line-clamp-1 text-[#8C8C8C] text-sm">
										{bodyText?.slice(0, 120) ||
											(typeof bodyHtml === "string"
												? bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 120)
												: "")}
									</p>
								)}
								{detailsOpen && !isCollapsed && (
									<div
										className="mt-3 space-y-1 rounded-lg border border-mail-border bg-[var(--inbox-muted-bg)] p-3 text-xs"
										onClick={(e) => e.stopPropagation()}
										onKeyDown={(e) => e.stopPropagation()}
									>
										<div className="flex gap-2">
											<span className="w-12 shrink-0 text-[#8C8C8C]">
												From:
											</span>
											<span className="text-mail-muted">
												{senderName}
												{senderEmail ? ` <${senderEmail}>` : ""}
											</span>
										</div>
										<div className="flex gap-2">
											<span className="w-12 shrink-0 text-[#8C8C8C]">To:</span>
											<span className="text-mail-muted">{toLabel}</span>
										</div>
										<div className="flex gap-2">
											<span className="w-12 shrink-0 text-[#8C8C8C]">
												Date:
											</span>
											<span className="text-mail-muted">
												{formatMessageTimestamp(msg.messageAt)}
											</span>
										</div>
									</div>
								)}
							</div>

							<div className="flex shrink-0 items-center gap-1">
								<time className="whitespace-nowrap text-[#8C8C8C] text-sm">
									{formatZeroMessageTime(msg.messageAt)}
								</time>
								<Dropdown.Root>
									<Dropdown.Trigger asChild>
										<button
											type="button"
											onClick={(e) => e.stopPropagation()}
											className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--inbox-control)] hover:bg-[#3d3d3d]"
										>
											<MoreHorizontal className="h-4 w-4 text-mail-muted" />
										</button>
									</Dropdown.Trigger>
									<Dropdown.Content
										align="end"
										className="min-w-40 border-mail-border bg-[var(--inbox-control)] p-1"
									>
										<Dropdown.Item
											className="rounded-md text-[13px] text-mail-muted"
											onSelect={onReply}
										>
											Reply
										</Dropdown.Item>
										{onReplyAll && (
											<Dropdown.Item
												className="rounded-md text-[13px] text-mail-muted"
												onSelect={onReplyAll}
											>
												Reply all
											</Dropdown.Item>
										)}
										<Dropdown.Item
											className="rounded-md text-[13px] text-mail-muted"
											onSelect={onForward}
										>
											Forward
										</Dropdown.Item>
										<Dropdown.Item
											className="rounded-md text-[13px] text-mail-muted"
											onSelect={onPrint}
										>
											Print
										</Dropdown.Item>
										<Dropdown.Item
											className="rounded-md text-[13px] text-red-400"
											onSelect={onDelete}
										>
											Delete
										</Dropdown.Item>
									</Dropdown.Content>
								</Dropdown.Root>
							</div>
						</div>
					</div>
				</div>

				<div
					className={cn(
						"grid overflow-hidden duration-200",
						isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
					)}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<div className="min-h-0 overflow-hidden">
						<div className="px-4 pt-3 pb-2">
							<MessageBody
								bodyHtml={bodyHtml}
								bodyText={bodyText}
								isTranslated={isTranslated}
								targetLanguage={targetLanguage}
								messageId={msg.id}
							/>

							{isApproval && (
								<div className="mt-4">
									<MessageDraftBanner messageAt={msg.messageAt} />
								</div>
							)}

							{isOutbound && !isApproval && (
								<div className="mt-4">
									<MessageSentBanner
										messageAt={msg.messageAt}
										isAgent={isAgent}
									/>
								</div>
							)}

							{isApproval && (onApproveSend || onEditReply) && (
								<div className="mt-4">
									<MessageDraftActions
										onApproveSend={onApproveSend ?? (() => {})}
										onEditReply={onEditReply ?? (() => {})}
										onForward={onForward}
									/>
								</div>
							)}

							{displayAttachments.length > 0 && (
								<div className="mt-4">
									<MessageAttachments
										attachments={displayAttachments}
										messageId={email?.id || msg.inboundEmailId}
									/>
								</div>
							)}

							{msg.parsed && Object.keys(msg.parsed).length > 0 && (
								<div className="mt-4 rounded-lg border border-mail-border/30 bg-[var(--inbox-muted-bg)]/50">
									<MessageParsedData
										parsed={msg.parsed}
										isExpanded={parsedExpanded}
										onToggle={onToggleParsed}
									/>
								</div>
							)}

							<div className="my-2.5 flex flex-wrap gap-2">
								<ActionButton
									onClick={(e) => {
										e.stopPropagation();
										onReply();
									}}
									icon={
										<Reply className="h-3.5 w-3.5 text-[#9B9B9B]" />
									}
									text="Reply"
								/>
								{onReplyAll && (
									<ActionButton
										onClick={(e) => {
											e.stopPropagation();
											onReplyAll();
										}}
										icon={
											<ReplyAll className="h-3.5 w-3.5 text-[#9B9B9B]" />
										}
										text="Reply all"
									/>
								)}
								<ActionButton
									onClick={(e) => {
										e.stopPropagation();
										onForward();
									}}
									icon={
										<Forward className="h-3.5 w-3.5 text-[#9B9B9B]" />
									}
									text="Forward"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
