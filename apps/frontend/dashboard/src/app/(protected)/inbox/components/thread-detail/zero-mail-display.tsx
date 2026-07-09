"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Dropdown from "@reloop/ui/dropdown";
import { cn } from "@reloop/ui/cn";
import { MoreHorizontal, Tag } from "lucide-react";
import { useState } from "react";
import type { AgentMailbox } from "../../types";
import { MessageAttachments } from "./message-attachments";
import { MessageBody } from "./message-body";
import { MessageDraftActions } from "./message-draft-actions";
import { MessageDraftBanner } from "./message-draft-banner";
import { MessageParsedData } from "./message-parsed-data";
import { MessageSentBanner } from "./message-sent-banner";
import { formatMessageTimestamp, formatZeroMessageTime } from "./date-utils";

const cleanName = (name?: string | null) =>
	(name ?? "").replace(/["<>]/g, "") || "Unknown";

export const ZeroMailDisplay = ({
	msg,
	mailbox,
	threadSubject,
	index,
	totalCount,
	isTranslated,
	targetLanguage,
	translatedHtmlMap,
	translatedTextMap,
	parsedExpanded,
	onToggleParsed,
	onReply,
	onForward,
	onDelete,
	onPrint,
	onApproveSend,
	onEditReply,
}: {
	msg: any;
	mailbox: AgentMailbox | undefined;
	threadSubject: string;
	index: number;
	totalCount: number;
	isTranslated: boolean;
	targetLanguage: string;
	translatedHtmlMap: Record<string, string>;
	translatedTextMap: Record<string, string>;
	parsedExpanded: boolean;
	onToggleParsed: () => void;
	onReply: () => void;
	onForward: () => void;
	onDelete: () => void;
	onPrint: () => void;
	onApproveSend?: () => void;
	onEditReply?: () => void;
}) => {
	const [detailsOpen, setDetailsOpen] = useState(false);

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
	const senderEmail = msg.fromEmail || threadSubject;

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
			inboundEmailId: att.inboundEmailId || email?.id || msg.inboundEmailId,
			messageId: email?.id || msg.inboundEmailId || msg.id,
			...att,
		}),
	);

	return (
		<div className={cn("relative flex-1", index > 0 && "border-mail-border border-t")}>
			{index === 0 && (
				<div className="border-mail-border border-b px-4 py-4">
					<h1 className="font-medium text-base text-mail-foreground leading-snug">
						{threadSubject}
						{totalCount > 1 && (
							<span className="text-[#8C8C8C]"> [{totalCount}]</span>
						)}
					</h1>
					<div className="mt-2 flex items-center gap-1.5">
						<Tag className="h-3.5 w-3.5 text-[#F43F5E]" />
						<span className="rounded-md border border-mail-border/50 bg-[#262626] px-2 py-0.5 text-mail-foreground text-xs">
							{senderName}
						</span>
					</div>
				</div>
			)}

			<div className="flex flex-col pb-2">
				<div className="mt-3 flex w-full items-start justify-between gap-4 px-4">
					<div className="flex w-full gap-4">
						<div
							className={cn(
								"mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase",
								getAvatarGradient(senderEmail),
							)}
						>
							{getAvatarInitial(msg.fromName ?? null, senderEmail)}
						</div>

						<div className="flex w-full items-center justify-between gap-2">
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-semibold text-mail-foreground text-sm">
										{senderName}
									</span>
									<button
										type="button"
										onClick={() => setDetailsOpen((v) => !v)}
										className="text-[#8C8C8C] text-xs underline"
									>
										Details
									</button>
								</div>
								<p className="mt-0.5 text-[#8C8C8C] text-sm">
									To: {toLabel}
								</p>
								{detailsOpen && (
									<div className="mt-3 space-y-1 rounded-lg border border-mail-border bg-[#262626] p-3 text-xs">
										<div className="flex gap-2">
											<span className="w-12 shrink-0 text-[#8C8C8C]">From:</span>
											<span className="text-mail-muted">
												{senderName}{" "}
												&lt;{senderEmail}&gt;
											</span>
										</div>
										<div className="flex gap-2">
											<span className="w-12 shrink-0 text-[#8C8C8C]">To:</span>
											<span className="text-mail-muted">{toLabel}</span>
										</div>
										<div className="flex gap-2">
											<span className="w-12 shrink-0 text-[#8C8C8C]">Date:</span>
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
											className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#313131] hover:bg-[#3d3d3d]"
										>
											<MoreHorizontal className="h-4 w-4 text-mail-muted" />
										</button>
									</Dropdown.Trigger>
									<Dropdown.Content
										align="end"
										className="min-w-40 border-mail-border bg-[#313131] p-1"
									>
										<Dropdown.Item
											className="rounded-md text-[13px] text-mail-muted"
											onSelect={onReply}
										>
											Reply
										</Dropdown.Item>
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

				<div className="px-4 pt-3 pb-4">
					<MessageBody
						bodyHtml={bodyHtml}
						bodyText={bodyText}
						isTranslated={isTranslated}
						targetLanguage={targetLanguage}
					/>

					{isApproval && (
						<div className="mt-4">
							<MessageDraftBanner messageAt={msg.messageAt} />
						</div>
					)}

					{isOutbound && !isApproval && (
						<div className="mt-4">
							<MessageSentBanner messageAt={msg.messageAt} isAgent={isAgent} />
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
						<div className="mt-4 rounded-lg border border-mail-border/30 bg-[#262626]/50">
							<MessageParsedData
								parsed={msg.parsed}
								isExpanded={parsedExpanded}
								onToggle={onToggleParsed}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
