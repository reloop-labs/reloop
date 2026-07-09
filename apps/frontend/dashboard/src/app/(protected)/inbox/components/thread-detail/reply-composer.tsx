"use client";

import { Icon } from "@reloop/ui/icon";
import { cn } from "@reloop/ui/cn";
import { EditorContent } from "@tiptap/react";
import { Paperclip, Type, X as XIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ComposeToolbar } from "../compose/compose-toolbar";
import {
	type ComposeAttachment,
	formatBytes,
	toSendAttachments,
	uploadComposeFile,
} from "../compose/compose-attachments";
import { useComposeEditor } from "../compose/use-compose-editor";

interface ReplyComposerProps {
	toName: string;
	toEmail: string;
	fromEmail: string;
	/** Plain-text seed (e.g. agent suggested reply) */
	initialContent?: string;
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
}

function plainToHtml(text: string) {
	const escaped = text
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
	return escaped
		.split(/\n\s*\n/)
		.map((p) => `<p>${p.replaceAll("\n", "<br />")}</p>`)
		.join("");
}

export const ReplyComposer = ({
	toName,
	toEmail,
	fromEmail,
	initialContent = "",
	onSend,
	onClose,
}: ReplyComposerProps) => {
	const displayTo = toName ? `${toName} <${toEmail}>` : toEmail;
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [showToolbar, setShowToolbar] = useState(false);
	const [htmlBody, setHtmlBody] = useState(() =>
		initialContent ? plainToHtml(initialContent) : "",
	);
	const [textBody, setTextBody] = useState(initialContent);
	const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
	const htmlRef = useRef(htmlBody);
	const textRef = useRef(textBody);
	htmlRef.current = htmlBody;
	textRef.current = textBody;

	const editor = useComposeEditor({
		content: initialContent ? plainToHtml(initialContent) : "",
		placeholder: `Reply to ${toName || toEmail.split("@")[0]}...`,
		onUpdate: (html, text) => {
			setHtmlBody(html);
			setTextBody(text);
		},
		onModEnter: () => {
			if (!textRef.current.trim()) return;
			if (attachments.some((a) => a.isUploading)) {
				toast.error("Please wait for attachments to finish uploading.");
				return;
			}
			onSend({
				text: textRef.current.trim(),
				html: htmlRef.current,
				attachments: toSendAttachments(attachments),
			});
		},
	});

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
		textBody.trim().length > 0 && !attachments.some((a) => a.isUploading);

	return (
		<div
			{...getRootProps()}
			className={cn(
				"mx-5 my-4 rounded-xl border border-mail-border bg-panel-light shadow-sm dark:bg-panel-dark",
				isDragActive && "ring-2 ring-mail-primary/40",
			)}
		>
			<input {...getInputProps()} />
			<div className="flex items-center justify-between border-mail-border border-b px-4 py-3">
				<div className="flex flex-col gap-1 text-label-sm">
					<div className="flex items-center gap-2 text-mail-muted">
						<span className="w-12">To:</span>
						<span className="font-semibold text-mail-foreground">{displayTo}</span>
					</div>
					<div className="flex items-center gap-2 text-mail-muted">
						<span className="w-12">From:</span>
						<span className="text-mail-muted">{fromEmail}</span>
					</div>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)]"
				>
					<Icon name="cross" className="h-4 w-4" />
				</button>
			</div>

			{showToolbar && (
				<div className="border-mail-border border-b px-4 py-2">
					<ComposeToolbar editor={editor} />
				</div>
			)}

			<div className="px-4 py-3">
				<EditorContent editor={editor} />
				{attachments.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-2">
						{attachments.map((file) => (
							<div
								key={file.id}
								className="inline-flex items-center gap-1.5 rounded-md border border-mail-border bg-[var(--inbox-muted-bg)] px-2 py-1 text-xs"
							>
								<span className="max-w-[140px] truncate">{file.name}</span>
								<span className="text-mail-muted">{file.size}</span>
								{file.isUploading ? (
									<span className="text-mail-muted">…</span>
								) : (
									<button
										type="button"
										onClick={() =>
											setAttachments((prev) =>
												prev.filter((a) => a.id !== file.id),
											)
										}
										aria-label={`Remove ${file.name}`}
									>
										<XIcon className="h-3 w-3 text-mail-muted" />
									</button>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			<div className="flex items-center justify-between rounded-b-xl border-mail-border border-t bg-offset-light/30 px-4 py-2.5">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => {
							if (!canSend) return;
							onSend({
								text: textBody.trim(),
								html: htmlBody,
								attachments: toSendAttachments(attachments),
							});
						}}
						disabled={!canSend}
						className="flex items-center gap-1.5 rounded-lg bg-mail-primary px-4 py-1.5 font-semibold text-label-sm text-panel-light transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
					>
						<span>Send</span>
					</button>

					<button
						type="button"
						className={cn(
							"rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground",
							showToolbar && "bg-[var(--inbox-muted-bg)] text-mail-foreground",
						)}
						title="Formatting"
						onClick={() => setShowToolbar((v) => !v)}
					>
						<Type className="h-4 w-4" />
					</button>

					<button
						type="button"
						className="rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground"
						title="Attach files"
						onClick={() => fileInputRef.current?.click()}
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

				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-mail-muted hover:bg-red-50 hover:text-error-base dark:hover:bg-red-950/20"
					title="Discard draft"
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
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					</svg>
				</button>
			</div>
		</div>
	);
};
