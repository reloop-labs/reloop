import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import * as Modal from "@reloop/ui/modal";
import * as Popover from "@reloop/ui/popover";
import { toast } from "@reloop/ui/toast";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
	FileText,
	Image as ImageIcon,
	Paperclip,
	Sparkles,
	X as XIcon,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { extractBareEmail, formatRecipient } from "../../lib/email-address";
import { plainToHtml } from "../../lib/plain-to-html";
import { readAiTextStreamAfterThink } from "../../lib/read-ai-text-stream-after-think";
import type { AgentMailbox } from "../../types";
import { useAgentInbox } from "../agent-inbox-provider";
import {
	type AiDraftPhase,
	isAiDraftActive,
	isAiDraftBusy,
} from "./ai-draft-phase";
import { AiComposerSlot } from "./ai-composer-slot";
import { AiSparkleButton } from "./ai-sparkle-button";
import {
	ComposeBodyEditor,
	type ComposeBodyEditorHandle,
} from "./compose-body-editor";
import { ScheduleSendPicker } from "./schedule-send-picker";
import { showUndoSendToast } from "./undo-send-toast";
import { EmailPillsInput, validateEmail } from "../shared/email-pills-input";
import { LoadingDot } from "../shared/loading-dot";

/** Portaled compose UI (recipient suggestions + React Email menus). */
const isComposeFloatingUi = (target: EventTarget | null) =>
	target instanceof Element &&
	Boolean(
		target.closest(
			[
				"[data-compose-floating-ui]",
				"[data-re-slash-command]",
				"[data-re-bubble-menu]",
				"[data-re-node-selector-content]",
				"[data-re-link-selector-form]",
				"[data-re-btn-bm-toolbar]",
				"[data-tippy-root]",
			].join(", "),
		),
	);

interface ComposeModalProps {
	isOpen: boolean;
	onClose: () => void;
	mailbox: AgentMailbox;
}

interface ComposeFormValues {
	to: string[];
	subject: string;
	cc: string[];
	bcc: string[];
}

type AttachmentItem = {
	id: string;
	name: string;
	size: string;
	url: string;
	path: string;
	content_type: string;
	isUploading?: boolean;
};

const UNDO_STORAGE_KEY = "reloop-inbox-undo-compose";
/** Brief window to cancel a scheduled send from the toast (not used for immediate send). */
const SCHEDULE_UNDO_SECONDS = 15;

const formatBytes = (bytes: number, decimals = 1) => {
	if (!bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const AttachmentGlyph = ({ contentType }: { contentType: string }) => {
	if (contentType.startsWith("image/")) {
		return <ImageIcon className="h-3.5 w-3.5 text-mail-muted" />;
	}
	if (
		contentType.includes("pdf") ||
		contentType.includes("word") ||
		contentType.includes("sheet") ||
		contentType.includes("excel")
	) {
		return <FileText className="h-3.5 w-3.5 text-mail-muted" />;
	}
	return <Paperclip className="h-3.5 w-3.5 text-mail-muted" />;
};

export const ComposeModal = ({
	isOpen,
	onClose,
	mailbox,
}: ComposeModalProps) => {
	const {
		sendMessage,
		removeOptimisticOutbound,
		threads,
		saveDraft,
		deleteDraft,
		getDraft,
	} = useAgentInbox();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [draftId, setDraftId] = useQueryState(
		"draftId",
		parseAsString.withDefault(""),
	);

	const { control, handleSubmit, register, reset, watch, setFocus, setValue } =
		useForm<ComposeFormValues>({
			defaultValues: { to: [], subject: "", cc: [], bcc: [] },
		});

	const to = watch("to") || [];
	const subject = watch("subject") || "";
	const cc = watch("cc") || [];
	const bcc = watch("bcc") || [];

	const [showCc, setShowCc] = useState(false);
	const [showBcc, setShowBcc] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [scheduleAt, setScheduleAt] = useState<string | undefined>();
	const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
	const [htmlBody, setHtmlBody] = useState("");
	const [textBody, setTextBody] = useState("");
	const [editorContent, setEditorContent] = useState("");
	const [editorKey, setEditorKey] = useState(0);
	const [showDiscard, setShowDiscard] = useState(false);
	const [aiPhase, setAiPhase] = useState<AiDraftPhase>("idle");
	const aiAbortRef = useRef<AbortController | null>(null);
	const aiRestoreRef = useRef<{ html: string; text: string } | null>(null);
	const reviewArmedRef = useRef(false);
	const aiPhaseRef = useRef<AiDraftPhase>("idle");
	const [subjectGenerating, setSubjectGenerating] = useState(false);
	const [toError, setToError] = useState<string | null>(null);
	const draftTimer = useRef<number | null>(null);
	const currentDraftId = useRef<string | null>(null);
	const editorRef = useRef<ComposeBodyEditorHandle>(null);
	const htmlRef = useRef(htmlBody);
	const textRef = useRef(textBody);
	htmlRef.current = htmlBody;
	textRef.current = textBody;
	aiPhaseRef.current = aiPhase;
	const aiBusy = isAiDraftBusy(aiPhase);
	const aiActive = isAiDraftActive(aiPhase);
	const shouldReduceMotion = useReducedMotion();

	const modKey =
		typeof navigator !== "undefined" &&
		/Mac|iPhone|iPod|iPad/i.test(navigator.platform)
			? "⌘"
			: "Ctrl";

	const recipientSuggestions = useMemo(() => {
		const map = new Map<string, string>();
		for (const t of threads) {
			if (!t.from?.email) continue;
			const key = extractBareEmail(t.from.email).toLowerCase();
			if (!key || map.has(key)) continue;
			map.set(key, formatRecipient(t.from.name, t.from.email));
		}
		return Array.from(map.values());
	}, [threads]);

	const submitRef = useRef<() => void>(() => {});

	const remountEditor = useCallback((html = "") => {
		setEditorContent(html);
		setHtmlBody(html);
		setEditorKey((k) => k + 1);
	}, []);

	const writeStreamedText = useCallback(
		(plain: string) => {
			let bodyText = plain;
			const subjectMatch = plain.match(/^Subject:\s*([^\r\n]+)\r?\n+/i);
			if (subjectMatch) {
				const extractedSubject = subjectMatch[1]?.trim();
				if (extractedSubject) {
					setValue("subject", extractedSubject);
				}
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
		},
		[setValue],
	);

	const restoreEditor = useCallback(
		(snapshot: { html: string; text: string }) => {
			setTextBody(snapshot.text);
			textRef.current = snapshot.text;
			htmlRef.current = snapshot.html;
			remountEditor(snapshot.html || "");
		},
		[remountEditor],
	);

	const hasContent =
		to.length > 0 ||
		cc.length > 0 ||
		bcc.length > 0 ||
		subject.trim().length > 0 ||
		textBody.trim().length > 0 ||
		attachments.length > 0;

	const resetComposer = useCallback(() => {
		reset({ to: [], subject: "", cc: [], bcc: [] });
		setShowCc(false);
		setShowBcc(false);
		setAttachments([]);
		setScheduleAt(undefined);
		setHtmlBody("");
		setTextBody("");
		setAiPhase("idle");
		aiRestoreRef.current = null;
		setToError(null);
		currentDraftId.current = null;
		remountEditor("");
	}, [reset, remountEditor]);

	useEffect(() => {
		if (!isOpen) return;
		let cancelled = false;

		const hydrate = async () => {
			if (draftId) {
				try {
					const draft = await getDraft(draftId);
					if (cancelled || !draft) return;
					currentDraftId.current = draft.id;
					reset({
						to: draft.to ?? [],
						subject: draft.subject ?? "",
						cc: draft.cc ?? [],
						bcc: draft.bcc ?? [],
					});
					if ((draft.cc?.length ?? 0) > 0) setShowCc(true);
					if ((draft.bcc?.length ?? 0) > 0) setShowBcc(true);
					setAttachments(
						(draft.attachments ?? []).map(
							(
								a: {
									id?: string;
									filename?: string;
									path?: string;
									url?: string;
									content_type?: string;
									size?: string;
								},
								i: number,
							) => ({
								id: a.id || String(i),
								name: a.filename || "file",
								size: a.size || "",
								url: a.url || a.path || "",
								path: a.path || a.url || "",
								content_type: a.content_type || "application/octet-stream",
							}),
						),
					);
					setTextBody(draft.text || "");
					remountEditor(draft.html || "");
					return;
				} catch {
					/* fall through */
				}
			}

			try {
				const raw = localStorage.getItem(UNDO_STORAGE_KEY);
				if (raw) {
					const data = JSON.parse(raw) as {
						to?: string[];
						cc?: string[];
						bcc?: string[];
						subject?: string;
						html?: string;
						text?: string;
					};
					localStorage.removeItem(UNDO_STORAGE_KEY);
					reset({
						to: data.to ?? [],
						subject: data.subject ?? "",
						cc: data.cc ?? [],
						bcc: data.bcc ?? [],
					});
					if ((data.cc?.length ?? 0) > 0) setShowCc(true);
					if ((data.bcc?.length ?? 0) > 0) setShowBcc(true);
					if (data.html) {
						setTextBody(data.text || "");
						remountEditor(data.html);
					}
					return;
				}
			} catch {
				/* ignore */
			}

			resetComposer();
			const t = window.setTimeout(() => setFocus("to"), 50);
			return () => window.clearTimeout(t);
		};

		void hydrate();
		return () => {
			cancelled = true;
		};
	}, [
		isOpen,
		draftId,
		getDraft,
		reset,
		resetComposer,
		setFocus,
		remountEditor,
	]);

	// Autosave draft every 3s
	useEffect(() => {
		if (!isOpen || !hasContent) return;
		if (draftTimer.current) window.clearTimeout(draftTimer.current);
		draftTimer.current = window.setTimeout(() => {
			void (async () => {
				try {
					const saved = await saveDraft({
						id: currentDraftId.current || undefined,
						mailboxId: mailbox.id,
						kind: "compose",
						to,
						cc,
						bcc,
						subject,
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
					if (saved?.id) {
						currentDraftId.current = saved.id;
						if (draftId !== saved.id) void setDraftId(saved.id);
					}
				} catch {
					/* silent */
				}
			})();
		}, 3000);
		return () => {
			if (draftTimer.current) window.clearTimeout(draftTimer.current);
		};
	}, [
		isOpen,
		hasContent,
		to,
		cc,
		bcc,
		subject,
		htmlBody,
		textBody,
		attachments,
		mailbox.id,
		saveDraft,
		draftId,
		setDraftId,
	]);

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
			const formData = new FormData();
			formData.append("file", file);
			const res = await fetch("/api/upload/v1/upload", {
				method: "POST",
				body: formData,
			});
			if (!res.ok) throw new Error("Upload failed");
			const data = (await res.json()) as { url: string; path: string };
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
		async (acceptedFiles: File[]) => {
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

	const requestClose = () => {
		if (isSending) return;
		if (hasContent) {
			setShowDiscard(true);
			return;
		}
		void setDraftId(null);
		onClose();
	};

	const confirmDiscard = async () => {
		setShowDiscard(false);
		if (currentDraftId.current) {
			try {
				await deleteDraft(currentDraftId.current);
			} catch {
				/* ignore */
			}
		}
		void setDraftId(null);
		resetComposer();
		onClose();
	};

	const saveDraftAndClose = async () => {
		setShowDiscard(false);
		if (draftTimer.current) {
			window.clearTimeout(draftTimer.current);
			draftTimer.current = null;
		}
		try {
			const saved = await saveDraft({
				id: currentDraftId.current || undefined,
				mailboxId: mailbox.id,
				kind: "compose",
				to,
				cc,
				bcc,
				subject,
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
			if (saved?.id) currentDraftId.current = saved.id;
			toast.success("Draft saved");
		} catch {
			toast.error("Couldn't save draft");
			return;
		}
		void setDraftId(null);
		resetComposer();
		onClose();
	};

	const onSubmit = async (data: ComposeFormValues) => {
		if (data.to.length === 0) {
			setToError("Add at least one recipient");
			return;
		}
		if (
			data.to.some((e) => !validateEmail(e)) ||
			data.cc.some((e) => !validateEmail(e)) ||
			data.bcc.some((e) => !validateEmail(e))
		) {
			setToError("Fix invalid email addresses before sending");
			return;
		}
		setToError(null);
		if (attachments.some((att) => att.isUploading)) {
			toast.error("Please wait for attachments to finish uploading.");
			return;
		}

		const exported = (await editorRef.current?.getEmail()) ?? {
			html: htmlBody,
			text: textBody,
		};

		setIsSending(true);
		try {
			const result = await sendMessage({
				mailboxId: mailbox.id,
				to: data.to,
				subject: data.subject || "(No Subject)",
				text: exported.text || textBody,
				html: exported.html || htmlBody,
				cc: data.cc.length > 0 ? data.cc : undefined,
				bcc: data.bcc.length > 0 ? data.bcc : undefined,
				attachments: attachments
					.filter((att) => !att.isUploading && (att.path || att.url))
					.map((att) => ({
						filename: att.name,
						path: att.path || att.url,
						content_type: att.content_type,
					})),
				scheduledAt: scheduleAt,
				// Immediate send — no Gmail-style undo delay.
				undoWindowSeconds: 0,
			});

			if (currentDraftId.current) {
				try {
					await deleteDraft(currentDraftId.current);
				} catch {
					/* ignore */
				}
			}

			if (scheduleAt && result?.pending && result.id) {
				const pendingId = result.id;
				const restorePayload = {
					to: data.to,
					cc: data.cc,
					bcc: data.bcc,
					subject: data.subject,
					html: exported.html || htmlBody,
					text: exported.text || textBody,
				};
				showUndoSendToast({
					variant: "schedule",
					seconds: SCHEDULE_UNDO_SECONDS,
					onUndo: async () => {
						try {
							const cancelRes = await fetch(
								`/api/inbox/v1/messages/pending/${pendingId}/cancel`,
								{ method: "POST" },
							);
							if (!cancelRes.ok) {
								throw new Error("Cancel failed");
							}
							removeOptimisticOutbound(pendingId);
							localStorage.setItem(
								UNDO_STORAGE_KEY,
								JSON.stringify(restorePayload),
							);
							toast.success("Send cancelled");
						} catch {
							toast.error("Failed to undo send");
						}
					},
				});
			} else {
				toast.success(
					scheduleAt ? "Email scheduled" : "Email sent successfully!",
				);
			}

			void setDraftId(null);
			resetComposer();
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to send email");
		} finally {
			setIsSending(false);
		}
	};

	submitRef.current = () => {
		void handleSubmit(onSubmit)();
	};

	const generateSubject = async (fromText?: string) => {
		const text =
			fromText ?? editorRef.current?.editor?.getText() ?? textBody;
		if (!text.trim()) {
			toast.error("Write some content first");
			return;
		}
		setSubjectGenerating(true);
		try {
			const res = await fetch("/api/inbox/v1/ai/subject", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text }),
			});
			if (!res.ok) throw new Error("Failed");
			const data = (await res.json()) as { subject?: string };
			if (data.subject) {
				const cleaned = data.subject.replace(/^Subject:\s*/i, "").trim();
				setValue("subject", cleaned);
			}
		} catch {
			toast.error("Failed to generate subject");
		} finally {
			setSubjectGenerating(false);
		}
	};

	const generateBody = async () => {
		const prompt = editorRef.current?.editor?.getText() || textRef.current;
		if (!prompt.trim()) {
			toast.error("Write a prompt or draft first");
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

		// Keep current text visible with shimmer until the first token.
		setAiPhase("thinking");

		try {
			if (!subject.trim()) await generateSubject(prompt);

			const res = await fetch("/api/inbox/v1/ai/compose", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: abort.signal,
				body: JSON.stringify({
					prompt,
					subject: watch("subject"),
					to,
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
				restoreEditor(previous);
				aiRestoreRef.current = null;
				setAiPhase("idle");
				toast.error("Failed to generate email");
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
				if (restore) restoreEditor(restore);
				aiRestoreRef.current = null;
				reviewArmedRef.current = false;
				setAiPhase("idle");
				return;
			}
			toast.error("Failed to generate email");
			restoreEditor(previous);
			aiRestoreRef.current = null;
			reviewArmedRef.current = false;
			setAiPhase("idle");
		} finally {
			if (aiAbortRef.current === abort) {
				aiAbortRef.current = null;
			}
		}
	};

	const rejectAiDraft = () => {
		aiAbortRef.current?.abort();
		aiAbortRef.current = null;
		const restore = aiRestoreRef.current;
		if (restore) {
			restoreEditor(restore);
			aiRestoreRef.current = null;
		}
		reviewArmedRef.current = false;
		setAiPhase("idle");
	};

	const acceptAiDraft = () => {
		aiAbortRef.current = null;
		aiRestoreRef.current = null;
		reviewArmedRef.current = false;
		setAiPhase("idle");
	};

	const removeAttachment = (indexToRemove: number) => {
		setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
	};

	const toolBtnClass =
		"inline-flex h-8 items-center gap-1.5 rounded-lg border border-mail-border/50 bg-transparent px-2.5 font-medium text-[12px] text-mail-muted transition-[transform,background-color,color] duration-150 ease-out hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97] disabled:opacity-40";

	return (
		<>
			<Modal.Root
				open={isOpen}
				onOpenChange={(open) => {
					if (!open) requestClose();
				}}
			>
				<Modal.Content
					showClose={false}
					className="flex max-h-[min(720px,90dvh)] w-full flex-col overflow-hidden rounded-3xl border border-mail-border/40 p-0 sm:max-w-[680px]"
					aria-describedby={undefined}
					onEscapeKeyDown={(e) => {
						e.preventDefault();
						if (aiActive) {
							rejectAiDraft();
							return;
						}
						requestClose();
					}}
					onPointerDownOutside={(e) => {
						if (isSending || isComposeFloatingUi(e.target)) {
							e.preventDefault();
						}
					}}
					onInteractOutside={(e) => {
						if (isSending || isComposeFloatingUi(e.target)) {
							e.preventDefault();
						}
					}}
					onFocusOutside={(e) => {
						if (isComposeFloatingUi(e.target)) e.preventDefault();
					}}
				>
					<form
						onSubmit={handleSubmit(onSubmit)}
						{...getRootProps()}
						className="relative flex min-h-0 flex-1 flex-col"
					>
						<input {...getInputProps()} />
						<input
							ref={fileInputRef}
							type="file"
							className="hidden"
							multiple
							accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
							onChange={(e) => {
								const files = e.target.files;
								if (files) void onDrop(Array.from(files));
								e.target.value = "";
							}}
						/>

						<AnimatePresence>
							{isDragActive && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-3xl bg-panel-light/95 dark:bg-panel-dark/95"
								>
									<Paperclip className="h-7 w-7 text-mail-muted" />
									<p className="font-medium text-mail-foreground text-sm">
										Drop files to attach
									</p>
									<p className="text-[12px] text-mail-muted">Max 10MB each</p>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Header */}
						<div className="shrink-0 border-mail-border/40 border-b px-5 pt-5 pb-3">
							<div className="mb-3 flex items-center justify-between gap-3">
								<div className="flex items-center gap-2.5">
									<Icon
										name="pencil"
										className="h-4 w-4 text-mail-foreground"
									/>
									<Modal.Title asChild>
										<h2 className="font-semibold text-label-md text-mail-foreground">
											New email
										</h2>
									</Modal.Title>
								</div>
								<button
									type="button"
									onClick={requestClose}
									disabled={isSending}
									className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-mail-muted transition-transform duration-150 ease-out hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.95] disabled:opacity-50"
									aria-label="Close"
								>
									<Icon name="cross" className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>

						{/* Fields + editor */}
						<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
							<div className="shrink-0 border-mail-border/40 border-b px-5">
								{/* From */}
								<div className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-x-2 border-mail-border/30 border-b py-2">
									<span className="font-medium text-[12px] text-mail-muted leading-none">
										From
									</span>
									<div className="flex h-8 min-w-0 items-center">
										<p className="truncate font-medium text-[13px] text-mail-foreground">
											{mailbox.email}
										</p>
									</div>
								</div>

								{/* To */}
								<div className="grid grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-x-2 border-mail-border/30 border-b py-2">
									<span className="font-medium text-[12px] text-mail-muted leading-none">
										To
									</span>
									<div className="min-w-0">
										<Controller
											name="to"
											control={control}
											render={({ field }) => (
												<EmailPillsInput
													emails={field.value}
													onChange={(emails) => {
														field.onChange(emails);
														if (toError) setToError(null);
													}}
													placeholder="Add recipients…"
													disabled={isSending}
													suggestions={recipientSuggestions}
												/>
											)}
										/>
										{toError && (
											<p
												className="mt-1 text-[12px] text-error-base leading-snug"
												role="alert"
											>
												{toError}
											</p>
										)}
									</div>
									<div className="flex shrink-0 items-center gap-0.5 self-center">
										<button
											type="button"
											tabIndex={-1}
											onClick={() => setShowCc((v) => !v)}
											className={cn(
												"rounded-md px-1.5 py-1 font-medium text-[11px] text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground",
												showCc &&
													"bg-[var(--inbox-hover)] text-mail-foreground",
											)}
										>
											Cc
										</button>
										<button
											type="button"
											tabIndex={-1}
											onClick={() => setShowBcc((v) => !v)}
											className={cn(
												"rounded-md px-1.5 py-1 font-medium text-[11px] text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground",
												showBcc &&
													"bg-[var(--inbox-hover)] text-mail-foreground",
											)}
										>
											Bcc
										</button>
									</div>
								</div>

								<AnimatePresence initial={false}>
									{showCc && (
										<motion.div
											initial={
												shouldReduceMotion
													? { opacity: 0 }
													: { height: 0, opacity: 0 }
											}
											animate={
												shouldReduceMotion
													? { opacity: 1 }
													: { height: "auto", opacity: 1 }
											}
											exit={
												shouldReduceMotion
													? { opacity: 0 }
													: { height: 0, opacity: 0 }
											}
											transition={
												shouldReduceMotion
													? { duration: 0.15 }
													: { duration: 0.2, ease: [0.32, 0.72, 0, 1] }
											}
											className="overflow-hidden"
										>
											<div className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-x-2 border-mail-border/30 border-b py-2">
												<span className="font-medium text-[12px] text-mail-muted leading-none">
													Cc
												</span>
												<Controller
													name="cc"
													control={control}
													render={({ field }) => (
														<EmailPillsInput
															emails={field.value}
															onChange={field.onChange}
															placeholder="Add Cc…"
															disabled={isSending}
															suggestions={recipientSuggestions}
														/>
													)}
												/>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								<AnimatePresence initial={false}>
									{showBcc && (
										<motion.div
											initial={
												shouldReduceMotion
													? { opacity: 0 }
													: { height: 0, opacity: 0 }
											}
											animate={
												shouldReduceMotion
													? { opacity: 1 }
													: { height: "auto", opacity: 1 }
											}
											exit={
												shouldReduceMotion
													? { opacity: 0 }
													: { height: 0, opacity: 0 }
											}
											transition={
												shouldReduceMotion
													? { duration: 0.15 }
													: { duration: 0.2, ease: [0.32, 0.72, 0, 1] }
											}
											className="overflow-hidden"
										>
											<div className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-x-2 border-mail-border/30 border-b py-2">
												<span className="font-medium text-[12px] text-mail-muted leading-none">
													Bcc
												</span>
												<Controller
													name="bcc"
													control={control}
													render={({ field }) => (
														<EmailPillsInput
															emails={field.value}
															onChange={field.onChange}
															placeholder="Add Bcc…"
															disabled={isSending}
															suggestions={recipientSuggestions}
														/>
													)}
												/>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Subject */}
								<div className="grid grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-x-2 py-2">
									<span className="font-medium text-[12px] text-mail-muted leading-none">
										Subject
									</span>
									<input
										className="h-8 w-full min-w-0 bg-transparent font-medium text-[13px] text-mail-foreground outline-none placeholder:text-mail-muted"
										placeholder="What’s this about?"
										disabled={isSending}
										{...register("subject")}
									/>
									<AiSparkleButton
										onClick={() => void generateSubject()}
										disabled={isSending || subjectGenerating || !textBody.trim()}
										loading={subjectGenerating}
										variant="icon"
										size="sm"
										title="Suggest subject from body"
									/>
								</div>
							</div>

							{/* Body — editor + inline AI status below */}
							<div className="flex flex-col">
								{/* Editor — always fully visible */}
								<div
									className={cn(
										"flex min-h-[200px] flex-1 flex-col",
										aiPhase === "thinking" &&
											textBody.trim().length > 0 &&
											"ai-body-thinking",
									)}
								>
									<ComposeBodyEditor
										ref={editorRef}
										editorKey={editorKey}
										content={editorContent}
										editable={!isSending && !aiBusy}
										placeholder="Start writing…"
										className="compose-email-editor__content min-h-[200px] flex-1 px-5 pb-4"
										onUpdate={(html, text) => {
											setHtmlBody(html);
											setTextBody(text);
											if (
												aiPhaseRef.current === "review" &&
												reviewArmedRef.current
											) {
												acceptAiDraft();
											}
										}}
										onModEnter={() => submitRef.current()}
									/>
									<div className="mt-auto flex items-center justify-between gap-3 px-5 py-2">
										<p className="min-w-0 truncate text-[11px] text-mail-muted">
											Type{" "}
											<kbd className="rounded border border-mail-border/50 px-1 font-sans text-[10px]">
												/
											</kbd>{" "}
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
												onClick={() => void generateBody()}
												disabled={isSending || !textBody.trim()}
												variant="pill"
												label="Write with AI"
												title="Write email body with AI"
											/>
										)}
									</div>
								</div>
							</div>

							{/* Attachments strip */}
							<AnimatePresence initial={false}>
								{attachments.length > 0 && (
									<motion.div
										initial={
											shouldReduceMotion
												? { opacity: 0 }
												: { height: 0, opacity: 0 }
										}
										animate={
											shouldReduceMotion
												? { opacity: 1 }
												: { height: "auto", opacity: 1 }
										}
										exit={
											shouldReduceMotion
												? { opacity: 0 }
												: { height: 0, opacity: 0 }
										}
										transition={
											shouldReduceMotion
												? { duration: 0.15 }
												: { duration: 0.2, ease: [0.32, 0.72, 0, 1] }
										}
										className="shrink-0 overflow-hidden border-mail-border/40 border-t"
									>
										<div className="px-5 py-3">
											<div className="mb-2 flex items-center justify-between">
												<span className="font-medium text-[11px] text-mail-muted uppercase tracking-wide">
													Attachments ({attachments.length})
												</span>
												<Popover.Root>
													<Popover.Trigger asChild>
														<button
															type="button"
															className="text-[11px] text-mail-muted hover:text-mail-foreground"
														>
															Manage
														</button>
													</Popover.Trigger>
													<Popover.Content
														align="end"
														sideOffset={6}
														showArrow={false}
														className="z-[100] w-[320px] rounded-xl border border-mail-border/40 bg-panel-light p-0 shadow-lg dark:bg-panel-dark"
													>
														<div className="max-h-[240px] space-y-0.5 overflow-y-auto p-1.5">
															{attachments.map((file, idx) => (
																<div
																	key={file.id}
																	className={cn(
																		"flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--inbox-hover)]",
																		file.isUploading && "opacity-60",
																	)}
																>
																	<div className="flex min-w-0 flex-1 items-center gap-2.5">
																		<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--inbox-hover)]">
																			{file.isUploading ? (
																				<LoadingDot
																					label="Uploading"
																					className="text-mail-muted"
																					style={{ fontSize: 11 }}
																				/>
																			) : (
																				<AttachmentGlyph
																					contentType={file.content_type}
																				/>
																			)}
																		</div>
																		<div className="min-w-0 flex-1">
																			<p className="truncate text-[12px] text-mail-foreground">
																				{file.name}
																			</p>
																			<p className="text-[11px] text-mail-muted">
																				{file.size}
																			</p>
																		</div>
																	</div>
																	<button
																		type="button"
																		onClick={() => removeAttachment(idx)}
																		className="flex size-6 items-center justify-center rounded-md hover:bg-[var(--inbox-hover)]"
																		aria-label={`Remove ${file.name}`}
																	>
																		<XIcon className="h-3.5 w-3.5 text-mail-muted" />
																	</button>
																</div>
															))}
														</div>
													</Popover.Content>
												</Popover.Root>
											</div>
											<div className="flex flex-wrap gap-1.5">
												<AnimatePresence initial={false}>
													{attachments.map((file, idx) => (
														<motion.span
															key={file.id}
															layout={!shouldReduceMotion}
															initial={
																shouldReduceMotion
																	? { opacity: 0 }
																	: { opacity: 0, scale: 0.95 }
															}
															animate={
																shouldReduceMotion
																	? { opacity: 1 }
																	: { opacity: 1, scale: 1 }
															}
															exit={
																shouldReduceMotion
																	? { opacity: 0 }
																	: { opacity: 0, scale: 0.95 }
															}
															transition={
																shouldReduceMotion
																	? { duration: 0.1 }
																	: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
															}
															className="inline-flex max-w-[180px] items-center gap-1.5 rounded-lg border border-mail-border/40 bg-[var(--inbox-hover)] px-2 py-1 text-[11px] text-mail-foreground"
														>
															{file.isUploading ? (
																<LoadingDot
																	label="Uploading"
																	className="shrink-0 text-mail-muted"
																	style={{ fontSize: 10 }}
																/>
															) : (
																<AttachmentGlyph
																	contentType={file.content_type}
																/>
															)}
															<span className="truncate">{file.name}</span>
															<button
																type="button"
																onClick={() => removeAttachment(idx)}
																className="shrink-0 text-mail-muted hover:text-mail-foreground"
																aria-label={`Remove ${file.name}`}
															>
																<XIcon className="h-3 w-3" />
															</button>
														</motion.span>
													))}
												</AnimatePresence>
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Footer */}
						<div className="flex shrink-0 items-center justify-between gap-3 border-mail-border/40 border-t px-5 py-3.5">
							<div className="flex flex-wrap items-center gap-1.5">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									disabled={isSending}
									className={toolBtnClass}
								>
									<Paperclip className="h-3.5 w-3.5" />
									Attach
								</button>
								<ScheduleSendPicker
									value={scheduleAt}
									onChange={setScheduleAt}
									disabled={isSending}
								/>
							</div>

							<div className="flex items-center gap-2">
								{scheduleAt && (
									<span className="mr-auto truncate text-[11px] text-mail-muted">
										Scheduled{" "}
										{new Date(scheduleAt).toLocaleString(undefined, {
											dateStyle: "medium",
											timeStyle: "short",
										})}
									</span>
								)}
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									disabled={isSending}
									onClick={requestClose}
								>
									Cancel
									<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-mail-border bg-offset-light/50 p-px font-medium text-[10px]">
										Esc
									</span>
								</Button.Root>
								<FancyButton.Root
									type="submit"
									variant="neutral"
									size="xsmall"
									disabled={isSending || attachments.some((a) => a.isUploading)}
									className="min-w-[132px] justify-between pr-2 pl-3"
								>
									<span className="text-sm leading-none">
										{isSending ? "Sending…" : scheduleAt ? "Schedule" : "Send"}
									</span>
									{!isSending && (
										<div className="flex items-center gap-0.5 opacity-70">
											<KbdKeyOutline className="h-4 w-4 border-white/30 font-sans text-[9px] text-white">
												{modKey}
											</KbdKeyOutline>
											<KbdKeyOutline className="h-4 w-4 border-white/30 font-sans text-[9px] text-white">
												↵
											</KbdKeyOutline>
										</div>
									)}
								</FancyButton.Root>
							</div>
						</div>
					</form>
				</Modal.Content>
			</Modal.Root>

			<Modal.Root open={showDiscard} onOpenChange={setShowDiscard}>
				<Modal.Content className="max-w-sm overflow-hidden rounded-3xl border border-mail-border/40 p-0">
					<div className="px-5 pt-5 pb-2">
						<Modal.Title asChild>
							<h3 className="font-semibold text-label-md text-mail-foreground">
								Save draft?
							</h3>
						</Modal.Title>
						<Modal.Description asChild>
							<p className="mt-1.5 text-[13px] text-mail-muted leading-snug">
								Save this message to Drafts, or discard it permanently.
							</p>
						</Modal.Description>
					</div>
					<div className="flex flex-wrap justify-end gap-2 px-5 py-4">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => setShowDiscard(false)}
						>
							Keep editing
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							mode="filled"
							size="xsmall"
							onClick={() => void saveDraftAndClose()}
						>
							Save draft
						</Button.Root>
						<Button.Root
							type="button"
							variant="error"
							mode="filled"
							size="xsmall"
							onClick={() => void confirmDiscard()}
						>
							Discard
						</Button.Root>
					</div>
				</Modal.Content>
			</Modal.Root>
		</>
	);
};
