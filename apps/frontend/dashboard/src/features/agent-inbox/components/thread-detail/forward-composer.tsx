import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Paperclip } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useDraftAutosave } from "../../hooks/use-draft-autosave";
import type { ComposeDraftKind } from "../../types";
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
import { EmailPillsInput, validateEmail } from "../shared/email-pills-input";
import { LoadingDot } from "../shared/loading-dot";

export interface ForwardFormValues {
	to: string[];
	cc: string[];
	text: string;
	html: string;
	attachments?: Array<{
		filename?: string;
		path?: string;
		content_type?: string;
	}>;
}

export type ForwardDraftContext = {
	mailboxId: string;
	threadId: string;
	kind: Extract<ComposeDraftKind, "forward">;
	inReplyToMessageId: string;
	subject: string;
	draftId: string | null;
	onDraftIdChange: (id: string) => void;
	onDiscardDraft?: () => void;
};

interface ForwardComposerProps {
	originalFrom: string;
	originalDate: string;
	originalSubject: string;
	originalBodyText?: string;
	fromEmail: string;
	onSend: (data: ForwardFormValues) => void;
	onClose: () => void;
	isSending?: boolean;
	/** Skip enter motion (keyboard `F`). Exit still runs. */
	skipEnter?: boolean;
	initialTo?: string[];
	initialCc?: string[];
	initialContent?: string;
	initialHtml?: string;
	draft?: ForwardDraftContext;
}

const modKey =
	typeof navigator !== "undefined" &&
	/Mac|iPhone|iPad|iPod/.test(navigator.platform)
		? "⌘"
		: "Ctrl";

const actionKbdOnBlueClassName =
	"w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const easeOut = [0.16, 1, 0.3, 1] as const;

export const ForwardComposer = forwardRef<HTMLDivElement, ForwardComposerProps>(
	function ForwardComposer(
		{
			originalFrom,
			originalDate,
			originalSubject,
			originalBodyText,
			fromEmail,
			onSend,
			onClose,
			isSending,
			skipEnter = false,
			initialTo = [],
			initialCc = [],
			initialContent = "",
			initialHtml = "",
			draft,
		},
		ref,
	) {
		const reduceMotion = useReducedMotion();
		const fileInputRef = useRef<HTMLInputElement>(null);
		const editorRef = useRef<ComposeBodyEditorHandle>(null);
		const [htmlBody, setHtmlBody] = useState(initialHtml);
		const [textBody, setTextBody] = useState(initialContent);
		const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
		const [showCc, setShowCc] = useState(initialCc.length > 0);

		const { control, handleSubmit, watch } = useForm<{
			to: string[];
			cc: string[];
		}>({
			defaultValues: { to: initialTo, cc: initialCc },
		});

		const toValue = watch("to") || [];
		const ccValue = watch("cc") || [];

		const hasInvalidTo = toValue.some((email) => !validateEmail(email));
		const hasInvalidCc = ccValue.some((email) => !validateEmail(email));
		const canSend =
			toValue.length > 0 &&
			!hasInvalidTo &&
			!hasInvalidCc &&
			!isSending &&
			!attachments.some((a) => a.isUploading);

		const hasDraftContent =
			toValue.length > 0 || ccValue.length > 0 || textBody.trim().length > 0;

		useDraftAutosave({
			enabled: !!draft,
			hasContent: hasDraftContent,
			draftId: draft?.draftId ?? null,
			onDraftIdChange: draft?.onDraftIdChange ?? (() => {}),
			mailboxId: draft?.mailboxId ?? "",
			kind: "forward",
			threadId: draft?.threadId,
			inReplyToMessageId: draft?.inReplyToMessageId,
			to: toValue,
			cc: ccValue,
			subject: draft?.subject ?? originalSubject,
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

		const submit = async (data: { to: string[]; cc: string[] }) => {
			if (attachments.some((a) => a.isUploading)) {
				toast.error("Please wait for attachments to finish uploading.");
				return;
			}
			const exported = (await editorRef.current?.getEmail()) ?? {
				html: htmlBody,
				text: textBody,
			};
			onSend({
				to: data.to,
				cc: data.cc,
				text: (exported.text || textBody).trim(),
				html: exported.html || htmlBody,
				attachments: toSendAttachments(attachments),
			});
		};

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
				style={{ transformOrigin: "top center" }}
				className="mt-1 mr-4 mb-3 ml-[3.75rem] shrink-0"
			>
				<div
					{...getRootProps()}
					className={cn(
						"relative overflow-hidden rounded-3xl border border-mail-border bg-panel-light dark:bg-panel-dark",
						isDragActive && "ring-2 ring-mail-primary/40",
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

					{/* Header */}
					<div className="flex items-center gap-2 border-mail-border/40 border-b px-4 py-2.5">
						<span className="inline-flex items-center gap-1.5 font-medium text-[12px] text-mail-foreground">
							<Icon name="forward" className="h-3.5 w-3.5 text-mail-muted" />
							Forward
						</span>
						<span className="min-w-0 flex-1 truncate text-[12px] text-mail-muted">
							{originalSubject}
						</span>
						<button
							type="button"
							onClick={onClose}
							disabled={isSending}
							className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97] disabled:opacity-50"
							aria-label="Close forward"
						>
							<Icon name="cross" className="h-3.5 w-3.5" />
						</button>
					</div>

					{/* Recipients — compose-modal field language */}
					<div className="border-mail-border/40 border-b px-4">
						<div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-2 border-mail-border/30 border-b py-2">
							<span className="font-medium text-[12px] text-mail-muted leading-none">
								From
							</span>
							<p className="truncate font-medium text-[13px] text-mail-foreground">
								{fromEmail}
							</p>
						</div>

						<div className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-2 border-mail-border/30 border-b py-2">
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
											onChange={field.onChange}
											placeholder="Add recipients…"
											disabled={isSending}
										/>
									)}
								/>
							</div>
							<button
								type="button"
								tabIndex={-1}
								onClick={() => setShowCc((v) => !v)}
								className={cn(
									"rounded-md px-1.5 py-1 font-medium text-[11px] text-mail-muted transition-colors hover:bg-[var(--inbox-hover)] hover:text-mail-foreground",
									showCc && "bg-[var(--inbox-hover)] text-mail-foreground",
								)}
							>
								Cc
							</button>
						</div>

						<AnimatePresence initial={false}>
							{showCc && (
								<motion.div
									initial={
										reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
									}
									animate={
										reduceMotion
											? { opacity: 1 }
											: { height: "auto", opacity: 1 }
									}
									exit={
										reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
									}
									transition={{ duration: 0.18, ease: easeOut }}
									className="overflow-hidden"
								>
									<div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-2 py-2">
										<span className="font-medium text-[12px] text-mail-muted leading-none">
											Cc
										</span>
										<div className="min-w-0">
											<Controller
												name="cc"
												control={control}
												render={({ field }) => (
													<EmailPillsInput
														emails={field.value}
														onChange={field.onChange}
														placeholder="Add Cc…"
														disabled={isSending}
													/>
												)}
											/>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Note editor */}
					<div className="relative flex min-h-[140px] flex-col">
						<ComposeBodyEditor
							ref={editorRef}
							content={initialHtml}
							placeholder="Add a note (optional)…"
							className="compose-email-editor__content max-h-[220px] min-h-[120px] flex-1 overflow-y-auto px-4 pb-3"
							onUpdate={(html, text) => {
								setHtmlBody(html);
								setTextBody(text);
							}}
							onModEnter={() => {
								if (canSend) void handleSubmit(submit)();
							}}
						/>
					</div>

					{/* Forwarded original — compact quote */}
					<div className="mx-4 mb-3 rounded-2xl border border-mail-border/40 bg-[var(--inbox-muted-bg)] px-3 py-2.5">
						<p className="mb-1.5 font-medium text-[11px] text-mail-muted">
							Forwarded message
						</p>
						<div className="space-y-0.5 text-[11px] text-mail-muted leading-snug">
							<p className="truncate">
								<span className="text-mail-foreground/70">From</span>{" "}
								{originalFrom}
							</p>
							<p className="truncate">
								<span className="text-mail-foreground/70">Date</span>{" "}
								{originalDate}
							</p>
							<p className="truncate">
								<span className="text-mail-foreground/70">Subject</span>{" "}
								{originalSubject}
							</p>
						</div>
						{originalBodyText ? (
							<p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[11px] text-mail-muted/80 leading-relaxed">
								{originalBodyText}
							</p>
						) : null}
					</div>

					{/* Attachments */}
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

					{/* Footer */}
					<div className="flex items-center justify-between gap-3 px-4 pt-1 pb-3">
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isSending}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97] disabled:opacity-50"
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
								onClick={() => void handleSubmit(submit)()}
								className="min-w-[132px] justify-between pr-2 pl-3"
							>
								<span className="text-sm leading-none">
									{isSending ? "Sending…" : "Forward"}
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
