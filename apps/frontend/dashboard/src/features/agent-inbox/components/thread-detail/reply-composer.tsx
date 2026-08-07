import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Paperclip } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useDraftAutosave } from "../../hooks/use-draft-autosave";
import { extractBareEmail, extractDisplayName } from "../../lib/email-address";
import { plainToHtml } from "../../lib/plain-to-html";
import { readAiTextStreamAfterThink } from "../../lib/read-ai-text-stream-after-think";
import type { ComposeDraftKind } from "../../types";
import { AiComposerSlot } from "../compose/ai-composer-slot";
import {
	type AiDraftPhase,
	isAiDraftActive,
	isAiDraftBusy,
} from "../compose/ai-draft-phase";
import { AiSparkleButton } from "../compose/ai-sparkle-button";
import {
	type ComposeAttachment,
	formatBytes,
	toSendAttachments,
	uploadComposeFile,
} from "../compose/compose-attachments";
import {
	ComposeBodyEditor,
	type ComposeBodyEditorHandle,
} from "../compose/compose-body-editor";
import { LoadingDot } from "../shared/loading-dot";

type ReplyMode = "reply" | "replyAll";

export type ReplyDraftContext = {
	mailboxId: string;
	threadId: string;
	kind: Extract<ComposeDraftKind, "reply" | "reply_all">;
	inReplyToMessageId: string;
	subject: string;
	draftId: string | null;
	onDraftIdChange: (id: string) => void;
	/** Explicit Discard — delete draft then close. */
	onDiscardDraft?: () => void;
};

interface ReplyComposerProps {
	toName: string;
	toEmail: string;
	fromEmail: string;
	mode?: ReplyMode;
	canReplyAll?: boolean;
	/** Inline under a message vs sticky dock at the bottom of the thread. */
	variant?: "inline" | "dock";
	/** Skip enter motion (keyboard `R`/`A` — must feel instant). Exit still runs. */
	skipEnter?: boolean;
	/** Thread ID for context-aware AI reply drafts (loaded server-side). */
	threadId?: string | null;
	/** Plain-text seed (e.g. agent suggested reply) */
	initialContent?: string;
	/** HTML seed when reopening a saved draft */
	initialHtml?: string;
	draft?: ReplyDraftContext;
	onModeChange?: (mode: ReplyMode) => void;
	onSend: (payload: {
		text: string;
		html: string;
		attachments?: Array<{
			filename?: string;
			path?: string;
			content_type?: string;
		}>;
	}) => void;
	onClose: () => void;
	/** Parent-owned lock while the reply request is in flight. */
	isSending?: boolean;
}

const modKey =
	typeof navigator !== "undefined" &&
	/Mac|iPhone|iPad|iPod/.test(navigator.platform)
		? "⌘"
		: "Ctrl";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

/** Linear-style expo ease-out — snappy settle, no lag at the start. */
const easeOut = [0.16, 1, 0.3, 1] as const;

export const ReplyComposer = forwardRef<HTMLDivElement, ReplyComposerProps>(
	function ReplyComposer(
		{
			toName,
			toEmail,
			fromEmail,
			variant = "dock",
			skipEnter = false,
			threadId = null,
			initialContent = "",
			initialHtml = "",
			draft,
			onSend,
			onClose,
			isSending = false,
		},
		ref,
	) {
		const reduceMotion = useReducedMotion();
		const bareTo = extractBareEmail(toEmail) || toEmail;
		const displayName =
			extractDisplayName(toName) ||
			toName.trim() ||
			bareTo.split("@")[0] ||
			bareTo;
		const bareFrom = extractBareEmail(fromEmail) || fromEmail;
		const resolvedThreadId = threadId || draft?.threadId || null;

		const fileInputRef = useRef<HTMLInputElement>(null);
		const editorRef = useRef<ComposeBodyEditorHandle>(null);
		/** Sync lock covering the async getEmail() window before parent isSending flips. */
		const sendingRef = useRef(false);
		const seedHtml =
			initialHtml || (initialContent ? plainToHtml(initialContent) : "");
		const [editorKey, setEditorKey] = useState(0);
		const [editorContent, setEditorContent] = useState(seedHtml);
		const [htmlBody, setHtmlBody] = useState(seedHtml);
		const [textBody, setTextBody] = useState(initialContent);
		const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
		const [aiPhase, setAiPhase] = useState<AiDraftPhase>("idle");
		const aiAbortRef = useRef<AbortController | null>(null);
		const aiRestoreRef = useRef<{ html: string; text: string } | null>(null);
		const reviewArmedRef = useRef(false);
		const aiPhaseRef = useRef<AiDraftPhase>("idle");
		const htmlRef = useRef(htmlBody);
		const textRef = useRef(textBody);
		htmlRef.current = htmlBody;
		textRef.current = textBody;
		aiPhaseRef.current = aiPhase;
		const aiBusy = isAiDraftBusy(aiPhase);
		const aiActive = isAiDraftActive(aiPhase);

		useEffect(() => {
			if (!isSending) sendingRef.current = false;
		}, [isSending]);

		const remountEditor = useCallback((html = "") => {
			setEditorContent(html);
			setHtmlBody(html);
			setTextBody(
				html
					.replace(/<br\s*\/?>/gi, "\n")
					.replace(/<\/p>/gi, "\n\n")
					.replace(/<[^>]+>/g, "")
					.replace(/\n{3,}/g, "\n\n")
					.trim(),
			);
			setEditorKey((k) => k + 1);
		}, []);

		/** Replace editor contents with streamed plain text (old text is wiped). */
		const writeStreamedText = useCallback((plain: string) => {
			let bodyText = plain;
			const subjectMatch = plain.match(/^Subject:\s*[^\r\n]+\r?\n+/i);
			if (subjectMatch) {
				bodyText = plain.slice(subjectMatch[0].length);
			}
			const html = plainToHtml(bodyText);
			const editor = editorRef.current?.editor;
			if (editor && !editor.isDestroyed) {
				editor.commands.setContent(html || "<p></p>");
			}
			setHtmlBody(html);
			setTextBody(bodyText);
			htmlRef.current = html;
			textRef.current = bodyText;
		}, []);

		useDraftAutosave({
			enabled: !!draft,
			hasContent: textBody.trim().length > 0,
			draftId: draft?.draftId ?? null,
			onDraftIdChange: draft?.onDraftIdChange ?? (() => {}),
			mailboxId: draft?.mailboxId ?? "",
			kind: draft?.kind ?? "reply",
			threadId: draft?.threadId,
			inReplyToMessageId: draft?.inReplyToMessageId,
			to: [bareTo].filter(Boolean),
			subject: draft?.subject,
			html: htmlBody,
			text: textBody,
			attachments: attachments
				.filter((a) => !a.isUploading)
				.map((a) => ({
					id: a.id,
					filename: a.name,
					path: a.url || a.path,
					url: a.url,
					content_type: a.content_type,
					size: a.size,
				})),
		});

		useEffect(() => {
			const id = window.setTimeout(() => {
				editorRef.current?.editor?.commands.focus("end");
			}, 120);
			return () => window.clearTimeout(id);
		}, []);

		const send = useCallback(async () => {
			// Prevent double-submit from rapid clicks / Cmd+Enter while getEmail() awaits.
			if (isSending || sendingRef.current) return;
			if (!textRef.current.trim()) return;
			if (attachments.some((a) => a.isUploading)) {
				toast.error("Please wait for attachments to finish uploading.");
				return;
			}
			sendingRef.current = true;
			try {
				const exported = (await editorRef.current?.getEmail()) ?? {
					html: htmlRef.current,
					text: textRef.current,
				};
				onSend({
					text: (exported.text || textRef.current).trim(),
					html: exported.html || htmlRef.current,
					attachments: toSendAttachments(attachments),
				});
			} catch {
				sendingRef.current = false;
			}
		}, [attachments, isSending, onSend]);

		const generateReply = useCallback(async () => {
			if (!resolvedThreadId) {
				toast.error("Open a thread to draft an AI reply");
				return;
			}
			aiAbortRef.current?.abort();
			const abort = new AbortController();
			aiAbortRef.current = abort;

			const previous = {
				html: htmlRef.current,
				text: textRef.current,
			};
			aiRestoreRef.current = previous;

			const draftNudge = textRef.current.trim();
			const instruction =
				draftNudge.length > 0 && draftNudge.length <= 280
					? draftNudge
					: undefined;

			// Keep current text visible with shimmer until think delay + first token.
			setAiPhase("thinking");

			try {
				const res = await fetch("/api/inbox/v1/ai/reply", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					signal: abort.signal,
					body: JSON.stringify({
						threadId: resolvedThreadId,
						...(instruction ? { instruction } : {}),
					}),
				});
				if (!res.ok) throw new Error("Failed");

				const finalText = await readAiTextStreamAfterThink(
					res,
					(accumulated) => {
						writeStreamedText(accumulated);
					},
					{
						minThinkMs: previous.text.trim() ? undefined : 0,
						onReveal: () => setAiPhase("streaming"),
						signal: abort.signal,
					},
				);
				if (!finalText.trim()) {
					remountEditor(previous.html || "");
					aiRestoreRef.current = null;
					setAiPhase("idle");
					toast.error("Failed to generate reply");
					return;
				}
				setAiPhase("review");
				reviewArmedRef.current = false;
				window.setTimeout(() => {
					reviewArmedRef.current = true;
				}, 120);
			} catch {
				if (abort.signal.aborted) {
					const restore = aiRestoreRef.current;
					if (restore) remountEditor(restore.html || "");
					aiRestoreRef.current = null;
					reviewArmedRef.current = false;
					setAiPhase("idle");
					return;
				}
				toast.error("Failed to generate reply");
				remountEditor(previous.html || "");
				aiRestoreRef.current = null;
				reviewArmedRef.current = false;
				setAiPhase("idle");
			} finally {
				if (aiAbortRef.current === abort) {
					aiAbortRef.current = null;
				}
			}
		}, [resolvedThreadId, remountEditor, writeStreamedText]);

		const rejectAiDraft = useCallback(() => {
			aiAbortRef.current?.abort();
			aiAbortRef.current = null;
			const restore = aiRestoreRef.current;
			if (restore) {
				remountEditor(restore.html || "");
				aiRestoreRef.current = null;
			}
			reviewArmedRef.current = false;
			setAiPhase("idle");
		}, [remountEditor]);

		const acceptAiDraft = useCallback(() => {
			aiAbortRef.current = null;
			aiRestoreRef.current = null;
			reviewArmedRef.current = false;
			setAiPhase("idle");
		}, []);

		const uploadFile = useCallback(async (file: File) => {
			const tempId = Math.random().toString();
			setAttachments((prev) => [
				...prev,
				{
					id: tempId,
					name: file.name,
					size: formatBytes(file.size),
					url: "",
					path: "",
					content_type: file.type || "application/octet-stream",
					isUploading: true,
				},
			]);
			try {
				const data = await uploadComposeFile(file);
				setAttachments((prev) =>
					prev.map((att) =>
						att.id === tempId
							? { ...att, url: data.url, path: data.path, isUploading: false }
							: att,
					),
				);
			} catch {
				toast.error(`Failed to upload ${file.name}`);
				setAttachments((prev) => prev.filter((att) => att.id !== tempId));
			}
		}, []);

		const onDrop = useCallback(
			(acceptedFiles: File[]) => {
				for (const file of acceptedFiles) {
					if (file.size > 10 * 1024 * 1024) {
						toast.error(`${file.name} is too large. Max size is 10MB.`);
						continue;
					}
					void uploadFile(file);
				}
			},
			[uploadFile],
		);

		const { getRootProps, getInputProps, isDragActive } = useDropzone({
			onDrop,
			noClick: true,
			noKeyboard: true,
		});

		const canSend =
			textBody.trim().length > 0 &&
			!isSending &&
			!attachments.some((a) => a.isUploading);

		// Linear-like panel: scale from the trigger edge. Close = exact reverse of open.
		const duration = reduceMotion ? 0.1 : 0.16;
		const settled = {
			opacity: 1,
			transform: "scale(1)",
		} as const;
		const hidden = reduceMotion
			? { opacity: 0, transform: "scale(1)" }
			: { opacity: 0, transform: "scale(0.96)" };

		return (
			<motion.div
				ref={ref}
				initial={skipEnter ? false : hidden}
				animate={settled}
				exit={hidden}
				transition={{ duration, ease: easeOut }}
				style={{
					transformOrigin:
						variant === "inline" ? "top center" : "bottom center",
				}}
				className={cn(
					"shrink-0",
					// Match message body indent (avatar + gap) from ZeroMailDisplay
					variant === "inline" && "mt-1 mr-4 mb-3 ml-[3.75rem]",
				)}
			>
				<div
					{...getRootProps()}
					className={cn(
						"relative bg-panel-light dark:bg-panel-dark",
						variant === "dock" &&
							"border-mail-border/50 border-t shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)]",
						variant === "inline" &&
							"overflow-hidden rounded-3xl border border-mail-border",
						isDragActive &&
							(variant === "inline"
								? "ring-2 ring-mail-primary/40"
								: "ring-2 ring-mail-foreground/20 ring-inset"),
					)}
				>
					<input {...getInputProps()} />

					<AnimatePresence>
						{isDragActive && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15, ease: easeOut }}
								className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-panel-light/80 text-mail-muted text-sm backdrop-blur-[1px] dark:bg-panel-dark/80"
							>
								Drop files to attach
							</motion.div>
						)}
					</AnimatePresence>

					<div className="flex items-center gap-2 border-mail-border/40 border-b px-4 py-2.5">
						<div className="min-w-0 flex-1 truncate text-[12px] text-mail-muted">
							<span className="text-mail-muted">to </span>
							<span className="font-medium text-mail-foreground">
								{displayName}
							</span>
							{bareTo ? (
								<span className="text-mail-muted"> · {bareTo}</span>
							) : null}
						</div>

						<button
							type="button"
							onClick={onClose}
							className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97]"
							aria-label="Close reply"
						>
							<Icon name="cross" className="h-3.5 w-3.5" />
						</button>
					</div>

					{/* Same React Email editor + inbox toolbar as compose modal */}
					<div
						className={cn(
							"relative flex min-h-[180px] flex-col",
							aiPhase === "thinking" &&
								textBody.trim().length > 0 &&
								"ai-body-thinking",
						)}
					>
						<ComposeBodyEditor
							ref={editorRef}
							editorKey={editorKey}
							content={editorContent}
							editable={!aiBusy && !isSending}
							placeholder="Start writing…"
							className="compose-email-editor__content max-h-[280px] min-h-[160px] flex-1 overflow-y-auto px-4 pb-3"
							onUpdate={(html, text) => {
								setHtmlBody(html);
								setTextBody(text);
								if (aiPhaseRef.current === "review" && reviewArmedRef.current) {
									acceptAiDraft();
								}
							}}
							onModEnter={() => {
								if (!isSending && !sendingRef.current) void send();
							}}
						/>
						<div className="mt-auto flex items-center justify-between gap-3 px-4 pb-2">
							<p className="min-w-0 truncate text-[11px] text-mail-muted">
								Type <ActionKbd className="w-auto min-w-4 px-1">/</ActionKbd>{" "}
								for formatting commands
							</p>
							{aiActive ? (
								<AiComposerSlot
									loading={aiBusy}
									hasStreamText={aiPhase === "streaming"}
									onUndo={rejectAiDraft}
								/>
							) : (
								<AiSparkleButton
									onClick={() => void generateReply()}
									disabled={!resolvedThreadId}
									variant="pill"
									label="Suggest reply"
									title="Suggest a reply from this thread"
								/>
							)}
						</div>
					</div>

					<AnimatePresence initial={false}>
						{attachments.length > 0 && (
							<motion.div
								initial={reduceMotion ? { opacity: 0 } : false}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15, ease: easeOut }}
								className="flex flex-wrap gap-1.5 px-4 pb-2"
							>
								<AnimatePresence initial={false}>
									{attachments.map((file) => (
										<motion.div
											key={file.id}
											initial={
												reduceMotion
													? { opacity: 0 }
													: {
															opacity: 0,
															transform: "translateY(0px) scale(0.95)",
														}
											}
											animate={
												reduceMotion
													? { opacity: 1 }
													: {
															opacity: 1,
															transform: "translateY(0px) scale(1)",
														}
											}
											exit={
												reduceMotion
													? { opacity: 0 }
													: {
															opacity: 0,
															transform: "translateY(0px) scale(0.95)",
														}
											}
											transition={
												reduceMotion
													? { duration: 0.1 }
													: { duration: 0.18, ease: easeOut }
											}
											className="inline-flex h-7 max-w-[200px] items-center gap-1.5 rounded-lg border border-mail-border/40 bg-[var(--inbox-muted-bg)] px-2 text-[11px]"
										>
											<Paperclip className="h-3 w-3 shrink-0 text-mail-muted" />
											<span className="min-w-0 truncate font-medium text-mail-foreground">
												{file.name}
											</span>
											<span className="shrink-0 text-mail-muted">
												{file.size}
											</span>
											{file.isUploading ? (
												<span className="shrink-0 text-mail-muted">
													<LoadingDot
														label="Uploading"
														style={{ fontSize: 10 }}
													/>
												</span>
											) : (
												<button
													type="button"
													onClick={() =>
														setAttachments((prev) =>
															prev.filter((a) => a.id !== file.id),
														)
													}
													aria-label={`Remove ${file.name}`}
													className="shrink-0 rounded p-0.5 text-mail-muted hover:text-mail-foreground"
												>
													<Icon name="cross" className="h-3 w-3" />
												</button>
											)}
										</motion.div>
									))}
								</AnimatePresence>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="flex items-center justify-between gap-3 px-4 pt-1 pb-3">
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97]"
								aria-label="Attach files"
							>
								<Paperclip className="h-4 w-4" />
							</button>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								className="hidden"
								onChange={(e) => {
									const files = e.target.files;
									if (files) onDrop(Array.from(files));
									e.target.value = "";
								}}
							/>
							<span className="hidden text-[11px] text-mail-muted sm:inline">
								from {bareFrom}
							</span>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => {
									if (draft?.onDiscardDraft) draft.onDiscardDraft();
									else onClose();
								}}
								disabled={isSending}
								className="inline-flex h-8 items-center rounded-lg px-2.5 font-medium text-[12px] text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-danger-bg)] hover:text-[var(--inbox-danger-fg)] active:scale-[0.97] disabled:opacity-50"
							>
								Discard
							</button>
							<FancyButton.Root
								type="button"
								variant="neutral"
								size="xsmall"
								disabled={!canSend}
								onClick={() => void send()}
								className="min-w-[132px] justify-between pr-2 pl-3"
							>
								<span className="text-sm leading-none">
									{isSending ? "Sending…" : "Send"}
								</span>
								{!isSending && (
									<div className="flex items-center gap-0.5 opacity-90">
										<ActionKbd className={actionKbdOnBlueClassName}>
											{modKey}
										</ActionKbd>
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</div>
								)}
							</FancyButton.Root>
						</div>
					</div>
				</div>
			</motion.div>
		);
	},
);
