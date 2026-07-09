"use client";

import * as Modal from "@reloop/ui/modal";
import * as Popover from "@reloop/ui/popover";
import { cn } from "@reloop/ui/cn";
import { EditorContent } from "@tiptap/react";
import { AnimatePresence, motion } from "framer-motion";
import {
	Command,
	CornerDownLeft,
	Loader2,
	Paperclip,
	Plus,
	Sparkles,
	Type,
	X as XIcon,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AgentMailbox } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";
import { EmailPillsInput, validateEmail } from "./email-pills-input";
import { AiComposePreview } from "./compose/ai-compose-preview";
import { ComposeToolbar } from "./compose/compose-toolbar";
import { ScheduleSendPicker } from "./compose/schedule-send-picker";
import {
	type AppliedTemplate,
	TemplateButton,
} from "./compose/template-button";
import { useComposeEditor } from "./compose/use-compose-editor";

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
const UNDO_WINDOW_SECONDS = 15;

const formatBytes = (bytes: number, decimals = 1) => {
	if (!bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const attachmentIcon = (contentType: string) => {
	if (contentType.includes("pdf")) return "📄";
	if (contentType.includes("excel") || contentType.includes("spreadsheet"))
		return "📊";
	if (contentType.includes("word") || contentType.includes("wordprocessing"))
		return "📝";
	if (contentType.startsWith("image/")) return "🖼️";
	return "📎";
};

export const ComposeModal = ({
	isOpen,
	onClose,
	mailbox,
}: ComposeModalProps) => {
	const { sendMessage, threads, saveDraft, deleteDraft, getDraft } =
		useAgentInbox();
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
	const [showToolbar, setShowToolbar] = useState(false);
	const [scheduleAt, setScheduleAt] = useState<string | undefined>();
	const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
	const [htmlBody, setHtmlBody] = useState("");
	const [textBody, setTextBody] = useState("");
	const [showDiscard, setShowDiscard] = useState(false);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiPreviewHtml, setAiPreviewHtml] = useState<string | null>(null);
	const [subjectGenerating, setSubjectGenerating] = useState(false);
	const draftTimer = useRef<number | null>(null);
	const currentDraftId = useRef<string | null>(null);

	const recipientSuggestions = useMemo(() => {
		const map = new Map<string, string>();
		for (const t of threads) {
			if (!t.from?.email) continue;
			const key = t.from.email.toLowerCase();
			if (map.has(key)) continue;
			map.set(
				key,
				t.from.name ? `${t.from.name} <${t.from.email}>` : t.from.email,
			);
		}
		return Array.from(map.values());
	}, [threads]);

	const submitRef = useRef<() => void>(() => {});

	const editor = useComposeEditor({
		placeholder: "Start writing...",
		editable: !isSending,
		onUpdate: (html, text) => {
			setHtmlBody(html);
			setTextBody(text);
		},
		onModEnter: () => submitRef.current(),
	});

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
		setAiPreviewHtml(null);
		setShowToolbar(false);
		currentDraftId.current = null;
		editor?.commands.clearContent();
	}, [reset, editor]);

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
					setHtmlBody(draft.html || "");
					setTextBody(draft.text || "");
					if (draft.html) editor?.commands.setContent(draft.html);
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
						setHtmlBody(data.html);
						setTextBody(data.text || "");
						editor?.commands.setContent(data.html);
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
	}, [isOpen, draftId, getDraft, reset, resetComposer, setFocus, editor]);

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

	const onSubmit = async (data: ComposeFormValues) => {
		if (data.to.length === 0) {
			toast.error("Please specify at least one recipient.");
			return;
		}
		if (
			data.to.some((e) => !validateEmail(e)) ||
			data.cc.some((e) => !validateEmail(e)) ||
			data.bcc.some((e) => !validateEmail(e))
		) {
			toast.error("Please fix invalid email addresses before sending.");
			return;
		}
		if (attachments.some((att) => att.isUploading)) {
			toast.error("Please wait for attachments to finish uploading.");
			return;
		}

		const html = editor?.getHTML() || htmlBody;
		const text = editor?.getText() || textBody;

		setIsSending(true);
		try {
			const result = await sendMessage({
				mailboxId: mailbox.id,
				to: data.to,
				subject: data.subject || "(No Subject)",
				text,
				html,
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
				undoWindowSeconds: scheduleAt ? 0 : UNDO_WINDOW_SECONDS,
			});

			if (currentDraftId.current) {
				try {
					await deleteDraft(currentDraftId.current);
				} catch {
					/* ignore */
				}
			}

			if (result?.pending && result.id) {
				const pendingId = result.id;
				const restorePayload = {
					to: data.to,
					cc: data.cc,
					bcc: data.bcc,
					subject: data.subject,
					html,
					text,
				};
				toast.success(scheduleAt ? "Email scheduled" : "Email sent", {
					duration: UNDO_WINDOW_SECONDS * 1000,
					action: {
						label: "Undo",
						onClick: () => {
							void (async () => {
								try {
									await fetch(
										`/api/inbox/v1/messages/pending/${pendingId}/cancel`,
										{ method: "POST" },
									);
									localStorage.setItem(
										UNDO_STORAGE_KEY,
										JSON.stringify(restorePayload),
									);
									toast.success("Send cancelled");
								} catch {
									toast.error("Failed to undo send");
								}
							})();
						},
					},
				});
			} else {
				toast.success("Email sent successfully!");
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

	const generateSubject = async () => {
		const text = editor?.getText() || textBody;
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
			if (data.subject) setValue("subject", data.subject);
		} catch {
			toast.error("Failed to generate subject");
		} finally {
			setSubjectGenerating(false);
		}
	};

	const generateBody = async () => {
		const prompt = editor?.getText() || textBody;
		if (!prompt.trim()) {
			toast.error("Write a prompt or draft first");
			return;
		}
		setAiLoading(true);
		setAiPreviewHtml(null);
		try {
			if (!subject.trim()) await generateSubject();
			const res = await fetch("/api/inbox/v1/ai/compose", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt,
					subject: watch("subject"),
					to,
				}),
			});
			if (!res.ok) throw new Error("Failed");
			const data = (await res.json()) as { html?: string };
			setAiPreviewHtml(data.html || `<p>${prompt}</p>`);
		} catch {
			toast.error("Failed to generate email");
			setAiPreviewHtml(null);
		} finally {
			setAiLoading(false);
		}
	};

	const applyTemplate = (tpl: AppliedTemplate) => {
		if (tpl.subject) setValue("subject", tpl.subject);
		setHtmlBody(tpl.html);
		editor?.commands.setContent(tpl.html);
		setTextBody(editor?.getText() || "");
		toast.success(`Applied “${tpl.name}”`);
	};

	const removeAttachment = (indexToRemove: number) => {
		setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
	};

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
					overlayClassName="bg-black/50 p-4"
					className="flex w-full max-w-[750px] flex-col items-center gap-1 border-none bg-transparent p-0 shadow-none"
					onEscapeKeyDown={(e) => {
						e.preventDefault();
						requestClose();
					}}
					onPointerDownOutside={(e) => {
						if (isSending) e.preventDefault();
					}}
				>
					<div className="flex w-full justify-start">
						<button
							type="button"
							onClick={requestClose}
							disabled={isSending}
							className="flex cursor-pointer items-center gap-1 rounded-lg bg-[#F0F0F0] px-2 py-1 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:bg-[var(--inbox-muted-bg)] dark:hover:bg-[var(--inbox-control-hover)]"
						>
							<XIcon className="mt-0.5 h-3.5 w-3.5 text-mail-muted" />
							<span className="font-medium text-mail-muted text-sm dark:text-white">
								esc
							</span>
						</button>
					</div>

					<form
						onSubmit={handleSubmit(onSubmit)}
						{...getRootProps()}
						className="relative mb-12 flex max-h-[min(560px,85dvh)] w-full flex-col overflow-hidden rounded-2xl border border-[#E7E7E7] bg-[#FAFAFA] shadow-sm dark:border-[#252525] dark:bg-[#202020]"
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
									className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#FAFAFA]/90 backdrop-blur-sm dark:bg-[#202020]/90"
								>
									<Paperclip className="h-7 w-7 text-mail-muted" />
									<p className="font-medium text-mail-foreground text-sm">
										Drop files here to attach
									</p>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl">
							<div className="shrink-0 overflow-visible border-[#E7E7E7] border-b pb-2 dark:border-[#252525]">
								<div className="flex justify-between px-3 pt-3">
									<div className="flex min-w-0 w-full items-center gap-2">
										<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
											To:
										</p>
										<Controller
											name="to"
											control={control}
											render={({ field }) => (
												<EmailPillsInput
													emails={field.value}
													onChange={field.onChange}
													placeholder="Enter email address"
													disabled={isSending}
													suggestions={recipientSuggestions}
												/>
											)}
										/>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<button
											type="button"
											tabIndex={-1}
											onClick={() => setShowCc((v) => !v)}
											className={cn(
												"cursor-pointer rounded-sm px-1 py-0.5 font-medium text-[#8C8C8C] text-sm transition-colors hover:bg-gray-50 hover:text-[#A8A8A8] dark:hover:bg-[var(--inbox-control-hover)]",
												showCc && "text-mail-foreground",
											)}
										>
											Cc
										</button>
										<button
											type="button"
											tabIndex={-1}
											onClick={() => setShowBcc((v) => !v)}
											className={cn(
												"cursor-pointer rounded-sm px-1 py-0.5 font-medium text-[#8C8C8C] text-sm transition-colors hover:bg-gray-50 hover:text-[#A8A8A8] dark:hover:bg-[var(--inbox-control-hover)]",
												showBcc && "text-mail-foreground",
											)}
										>
											Bcc
										</button>
										<button
											type="button"
											tabIndex={-1}
											onClick={requestClose}
											disabled={isSending}
											className="cursor-pointer rounded-sm px-1 py-0.5 text-[#8C8C8C] transition-colors hover:bg-gray-50 hover:text-[#A8A8A8] dark:hover:bg-[var(--inbox-control-hover)]"
											aria-label="Close"
										>
											<XIcon className="h-3.5 w-3.5 text-[#9A9A9A]" />
										</button>
									</div>
								</div>

								{(showCc || showBcc) && (
									<div className="flex flex-col gap-2 pt-2">
										{showCc && (
											<div className="flex items-center gap-2 px-3">
												<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
													Cc:
												</p>
												<Controller
													name="cc"
													control={control}
													render={({ field }) => (
														<EmailPillsInput
															emails={field.value}
															onChange={field.onChange}
															placeholder="Enter email for Cc"
															disabled={isSending}
															suggestions={recipientSuggestions}
														/>
													)}
												/>
											</div>
										)}
										{showBcc && (
											<div className="flex items-center gap-2 px-3">
												<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
													Bcc:
												</p>
												<Controller
													name="bcc"
													control={control}
													render={({ field }) => (
														<EmailPillsInput
															emails={field.value}
															onChange={field.onChange}
															placeholder="Enter email for Bcc"
															disabled={isSending}
															suggestions={recipientSuggestions}
														/>
													)}
												/>
											</div>
										)}
									</div>
								)}
							</div>

							<div className="flex items-center gap-2 border-[#E7E7E7] border-b p-3 dark:border-[#252525]">
								<p className="shrink-0 font-medium text-[#8C8C8C] text-sm">
									Subject:
								</p>
								<input
									className="h-4 w-full bg-transparent font-normal text-sm leading-normal text-black outline-none placeholder:text-[#797979] dark:text-white/90"
									placeholder="Re: Design review feedback"
									disabled={isSending}
									{...register("subject")}
								/>
								<button
									type="button"
									tabIndex={-1}
									disabled={isSending || subjectGenerating || !textBody.trim()}
									onClick={() => void generateSubject()}
									className="rounded p-1 text-mail-muted transition-colors hover:bg-gray-50 disabled:opacity-40 dark:hover:bg-[var(--inbox-control-hover)]"
									aria-label="Generate subject"
								>
									{subjectGenerating ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Sparkles className="h-3.5 w-3.5" />
									)}
								</button>
							</div>

							<div className="relative flex-1 overflow-y-auto border-[#E7E7E7] border-t bg-white px-3 py-3 dark:border-[#252525] dark:bg-[#202020]">
								<div
									className={cn(
										"min-h-[200px]",
										(aiLoading || aiPreviewHtml) && "blur-sm",
									)}
									onClick={() => editor?.commands.focus()}
									onKeyDown={() => {}}
								>
									{editor ? (
										<EditorContent editor={editor} />
									) : (
										<div className="min-h-[200px] text-mail-muted text-sm">
											Loading editor…
										</div>
									)}
								</div>
								<AiComposePreview
									html={aiPreviewHtml}
									loading={aiLoading}
									onAccept={() => {
										if (!aiPreviewHtml) return;
										editor?.commands.setContent(aiPreviewHtml);
										setHtmlBody(aiPreviewHtml);
										setTextBody(editor?.getText() || "");
										setAiPreviewHtml(null);
									}}
									onReject={() => setAiPreviewHtml(null)}
								/>
							</div>
						</div>

						<div className="inline-flex w-full shrink-0 flex-col gap-2 self-stretch rounded-b-2xl bg-white px-3 py-3 dark:bg-[#202020]">
							{showToolbar && <ComposeToolbar editor={editor} />}
							<div className="flex items-center justify-between gap-2">
								<div className="flex flex-wrap items-center gap-2">
									<button
										type="submit"
										disabled={
											isSending ||
											to.length === 0 ||
											attachments.some((att) => att.isUploading)
										}
										className="inline-flex h-8 items-center gap-2 rounded-md bg-black px-3 text-sm text-white transition-opacity disabled:pointer-events-none disabled:opacity-40 dark:bg-white dark:text-black"
									>
										<span>
											{isSending
												? "Sending…"
												: scheduleAt
													? "Schedule"
													: "Send"}
										</span>
										<span className="hidden h-5 items-center gap-0.5 rounded-sm bg-white/10 px-1 sm:inline-flex dark:bg-black/10">
											<Command className="h-3.5 w-3.5" />
											<CornerDownLeft className="h-3.5 w-3.5" />
										</span>
									</button>

									<ScheduleSendPicker
										value={scheduleAt}
										onChange={setScheduleAt}
										disabled={isSending}
									/>

									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										disabled={isSending}
										className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-[#E7E7E7] bg-transparent px-2 text-sm text-mail-foreground transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-[#2B2B2B] dark:hover:bg-[var(--inbox-control-hover)]"
									>
										<Plus className="h-3 w-3 text-[#9A9A9A]" />
										<span className="hidden px-0.5 md:inline">Add</span>
									</button>

									<TemplateButton
										onApply={applyTemplate}
										disabled={isSending}
									/>

									{attachments.length > 0 && (
										<Popover.Root>
											<Popover.Trigger asChild>
												<button
													type="button"
													className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#E7E7E7] bg-white/5 px-2 py-1 text-sm hover:bg-black/5 dark:border-[#2B2B2B] dark:hover:bg-white/10"
												>
													<Paperclip className="h-3.5 w-3.5 text-[#9A9A9A]" />
													<span className="font-medium">
														{attachments.length}
													</span>
												</button>
											</Popover.Trigger>
											<Popover.Content
												align="start"
												sideOffset={6}
												showArrow={false}
												className="z-[100] w-[340px] rounded-lg border border-[#E7E7E7] bg-white p-0 shadow-lg dark:border-[#2B2B2B] dark:bg-[#202020]"
											>
												<div className="border-[#E7E7E7] border-b p-3 dark:border-[#2B2B2B]">
													<h4 className="font-semibold text-sm">
														Attachments
													</h4>
												</div>
												<div className="max-h-[250px] space-y-0.5 overflow-y-auto p-1.5">
													{attachments.map((file, idx) => (
														<div
															key={file.id}
															className={cn(
																"flex items-center justify-between gap-3 rounded-md px-1.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/10",
																file.isUploading && "opacity-60",
															)}
														>
															<div className="flex min-w-0 flex-1 items-center gap-3">
																<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#F0F0F0] dark:bg-[#2C2C2C]">
																	{file.isUploading ? (
																		<Loader2 className="h-3.5 w-3.5 animate-spin" />
																	) : (
																		<span className="text-sm">
																			{attachmentIcon(file.content_type)}
																		</span>
																	)}
																</div>
																<div className="min-w-0 flex-1">
																	<p className="truncate text-sm">{file.name}</p>
																	<p className="text-mail-muted text-xs">
																		{file.size}
																	</p>
																</div>
															</div>
															<button
																type="button"
																onClick={() => removeAttachment(idx)}
																className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/5"
															>
																<XIcon className="h-3.5 w-3.5 text-mail-muted" />
															</button>
														</div>
													))}
												</div>
											</Popover.Content>
										</Popover.Root>
									)}

									<button
										type="button"
										tabIndex={-1}
										onClick={() => setShowToolbar((v) => !v)}
										className={cn(
											"inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E7E7E7] transition-colors hover:bg-gray-50 dark:border-[#2B2B2B] dark:hover:bg-[var(--inbox-control-hover)]",
											showToolbar && "bg-[var(--inbox-muted-bg)]",
										)}
										aria-label="Formatting"
									>
										<Type className="h-4 w-4 text-mail-muted" />
									</button>
								</div>

								<button
									type="button"
									disabled={isSending || aiLoading || !textBody.trim()}
									onClick={() => void generateBody()}
									className="inline-flex h-8 items-center gap-1.5 rounded-md border border-violet-500/50 px-2.5 text-sm text-violet-400 transition-colors hover:bg-violet-500/10 disabled:opacity-40"
								>
									{aiLoading ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Sparkles className="h-3.5 w-3.5" />
									)}
									<span>Generate</span>
								</button>
							</div>
						</div>
					</form>
				</Modal.Content>
			</Modal.Root>

			<Modal.Root open={showDiscard} onOpenChange={setShowDiscard}>
				<Modal.Content className="max-w-sm p-5">
					<h3 className="font-semibold text-mail-foreground">Discard message?</h3>
					<p className="mt-1 text-mail-muted text-sm">
						Your draft will be deleted and this can’t be undone.
					</p>
					<div className="mt-4 flex justify-end gap-2">
						<button
							type="button"
							onClick={() => setShowDiscard(false)}
							className="rounded-md px-3 py-1.5 text-sm hover:bg-[var(--inbox-hover)]"
						>
							Keep editing
						</button>
						<button
							type="button"
							onClick={() => void confirmDiscard()}
							className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
						>
							Discard
						</button>
					</div>
				</Modal.Content>
			</Modal.Root>
		</>
	);
};
