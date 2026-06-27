"use client";

import type { AgentMailbox } from "../../types";
import { MessageAttachments } from "./message-attachments";
import { MessageBody } from "./message-body";
import { MessageDraftActions } from "./message-draft-actions";
import { MessageDraftBanner } from "./message-draft-banner";
import { MessageHeaderCollapsed } from "./message-header-collapsed";
import { MessageHeaderExpanded } from "./message-header-expanded";
import { MessageParsedData } from "./message-parsed-data";
import { MessageSentBanner } from "./message-sent-banner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThreadMessageItemProps {
	msg: any;
	index: number;
	mailbox: AgentMailbox | undefined;
	thread: any;
	isTranslated: boolean;
	targetLanguage: string;
	translatedHtmlMap: Record<string, string>;
	translatedTextMap: Record<string, string>;
	parsedExpanded: boolean;
	onToggleParsed: () => void;
	onReply: () => void;
	onForward: () => void;
	onDelete: () => void;
	onToggleRead: (isRead: boolean) => void;
	onMarkSpam: (isSpam: boolean) => void;
	onTranslate: () => void;
	onPrint: () => void;
	onDownload: () => void;
	onShowOriginal: () => void;
	onPrototypeAction: (action: string) => void;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onApproveSend?: () => void;
	onEditReply?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACCENT_COLORS = {
	approval: "#f59e0b",
	outbound: "#10b981",
	inbound: "#3b82f6",
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A single message card inside the thread accordion.
 *
 * Rendering is split across focused sub-components:
 *  - MessageHeaderCollapsed  – one-line collapsed row
 *  - MessageHeaderExpanded   – full header with avatar, meta, dropdown
 *  - MessageDraftBanner      – amber "held for approval" notice
 *  - MessageBody             – iframe / plain-text body
 *  - MessageDraftActions     – Approve & send / Edit reply / Forward buttons
 *  - MessageAttachments      – file list
 *  - MessageParsedData       – AI-parsed metadata accordion
 */
export const ThreadMessageItem = ({
	msg,
	mailbox,
	thread,
	isTranslated,
	targetLanguage,
	translatedHtmlMap,
	translatedTextMap,
	parsedExpanded,
	onToggleParsed,
	onReply,
	onForward,
	onDelete,
	onToggleRead,
	onMarkSpam,
	onTranslate,
	onPrint,
	onDownload,
	onShowOriginal,
	onPrototypeAction,
	isExpanded,
	onToggleExpand,
	onApproveSend,
	onEditReply,
}: ThreadMessageItemProps) => {
	// ── Derived flags ─────────────────────────────────────────────────────────
	const isOutbound = msg.direction === "outbound";
	const isApproval = msg.status === "needs_approval";
	const isAgent =
		msg.direction === "agent" ||
		Boolean(msg.isAgent) ||
		msg.fromEmail?.includes("agent");

	const accentColor = isApproval
		? ACCENT_COLORS.approval
		: isAgent
			? ACCENT_COLORS.inbound
			: ACCENT_COLORS.outbound;

	// ── Body content (translated or original) ─────────────────────────────────
	const email = msg.email;
	const key = `${msg.id}-${targetLanguage}`;

	const bodyHtml = isTranslated
		? translatedHtmlMap[key] || "Translating..."
		: email?.htmlBody;

	const bodyText = isTranslated
		? translatedTextMap[key] || "Translating..."
		: email?.textBody;

	// ── Attachments ───────────────────────────────────────────────────────────
	const displayAttachments = (email?.attachments || []).map((att: any) => ({
		name: att.filename || att.name || "Attachment",
		size:
			typeof att.size === "number"
				? `${(att.size / 1024).toFixed(1)} KB`
				: att.size || "Unknown size",
		...att,
	}));

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div className="relative overflow-hidden rounded-xl border border-stroke-inbox bg-white dark:border-stroke-soft-100/10 dark:bg-neutral-900">
			{!isExpanded ? (
				/* ── Collapsed ─────────────────────────────────────────────────── */
				<div>
					<MessageHeaderCollapsed
						msg={msg}
						isOutbound={isOutbound}
						isApproval={isApproval}
						isAgent={isAgent}
						accentColor={accentColor}
						onClick={onToggleExpand}
					/>
				</div>
			) : (
				/* ── Expanded ──────────────────────────────────────────────────── */
				<div>
					{/* Header */}
					<MessageHeaderExpanded
						msg={msg}
						mailbox={mailbox}
						thread={thread}
						isOutbound={isOutbound}
						isApproval={isApproval}
						isAgent={isAgent}
						accentColor={accentColor}
						onToggleExpand={onToggleExpand}
						onReply={onReply}
						onForward={onForward}
						onDelete={onDelete}
						onToggleRead={onToggleRead}
						onMarkSpam={onMarkSpam}
						onTranslate={onTranslate}
						onPrint={onPrint}
						onDownload={onDownload}
						onShowOriginal={onShowOriginal}
					/>

					{/* Indented Content Column */}
					<div className="flex flex-col gap-4 pr-5 pb-4 pl-[77px]">
						{/* Body */}
						<MessageBody
							bodyHtml={bodyHtml}
							bodyText={bodyText}
							isTranslated={isTranslated}
							targetLanguage={targetLanguage}
						/>

						{/* Draft held banner */}
						{isApproval && <MessageDraftBanner messageAt={msg.messageAt} />}

						{/* Sent status banner */}
						{isOutbound && !isApproval && (
							<MessageSentBanner messageAt={msg.messageAt} isAgent={isAgent} />
						)}

						{/* Approval action buttons */}
						{isApproval && (onApproveSend || onEditReply) && (
							<MessageDraftActions
								onApproveSend={onApproveSend ?? (() => {})}
								onEditReply={onEditReply ?? (() => {})}
								onForward={onForward}
							/>
						)}

						{/* Attachments */}
						<MessageAttachments
							attachments={displayAttachments}
							onDownload={(name) => onPrototypeAction(`Download ${name}`)}
						/>

						{/* Parsed metadata */}
						<MessageParsedData
							parsed={msg.parsed ?? {}}
							isExpanded={parsedExpanded}
							onToggle={onToggleParsed}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
