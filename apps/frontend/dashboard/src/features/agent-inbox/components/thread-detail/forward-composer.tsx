import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { EditorContent } from "@tiptap/react";
import { Paperclip, Type, X as XIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	type ComposeAttachment,
	formatBytes,
	toSendAttachments,
	uploadComposeFile,
} from "../compose/compose-attachments";
import { ComposeToolbar } from "../compose/compose-toolbar";
import { useComposeEditor } from "../compose/use-compose-editor";
import { EmailPillsInput, validateEmail } from "../email-pills-input";

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

interface ForwardComposerProps {
	originalFrom: string;
	originalDate: string;
	originalSubject: string;
	originalBodyText?: string;
	fromEmail: string;
	onSend: (data: ForwardFormValues) => void;
	onClose: () => void;
	isSending?: boolean;
}

export const ForwardComposer = ({
	originalFrom,
	originalDate,
	originalSubject,
	originalBodyText,
	fromEmail,
	onSend,
	onClose,
	isSending,
}: ForwardComposerProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [showToolbar, setShowToolbar] = useState(false);
	const [htmlBody, setHtmlBody] = useState("");
	const [textBody, setTextBody] = useState("");
	const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);

	const { control, handleSubmit, watch } = useForm<{
		to: string[];
		cc: string[];
	}>({
		defaultValues: { to: [], cc: [] },
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

	const editor = useComposeEditor({
		placeholder: "Add a note (optional)…",
		onUpdate: (html, text) => {
			setHtmlBody(html);
			setTextBody(text);
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

	const onSubmit = (data: { to: string[]; cc: string[] }) => {
		onSend({
			to: data.to,
			cc: data.cc,
			text: textBody.trim(),
			html: htmlBody,
			attachments: toSendAttachments(attachments),
		});
	};

	return (
		<div
			{...getRootProps()}
			className={cn(
				"mx-5 my-4 rounded-xl border border-mail-border bg-panel-light shadow-sm dark:bg-panel-dark",
				isDragActive && "ring-2 ring-mail-primary/40",
			)}
		>
			<input {...getInputProps()} />
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex items-center justify-between border-mail-border border-b px-4 py-3">
					<div className="flex items-center gap-2">
						<svg
							className="h-3.5 w-3.5 text-mail-foreground"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="15 17 20 12 15 7" />
							<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
						</svg>
						<span className="font-semibold text-label-sm text-mail-foreground">
							Forward
						</span>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)]"
					>
						<Icon name="cross" className="h-4 w-4" />
					</button>
				</div>

				<div className="flex flex-col gap-0 divide-y divide-stroke-inbox dark:divide-stroke-soft-100/30">
					<div className="flex items-center gap-2 px-4 py-2.5 text-label-sm">
						<span className="w-12 shrink-0 text-mail-muted">From:</span>
						<span className="text-mail-muted">{fromEmail}</span>
					</div>

					<div className="flex items-start gap-2 px-4 py-1 text-label-sm">
						<span className="w-12 shrink-0 py-2 text-mail-muted">To:</span>
						<Controller
							name="to"
							control={control}
							render={({ field }) => (
								<EmailPillsInput
									emails={field.value}
									onChange={field.onChange}
									placeholder="recipient@example.com"
									disabled={isSending}
								/>
							)}
						/>
					</div>

					<div className="flex items-start gap-2 px-4 py-1 text-label-sm">
						<span className="w-12 shrink-0 py-2 text-mail-muted">Cc:</span>
						<Controller
							name="cc"
							control={control}
							render={({ field }) => (
								<EmailPillsInput
									emails={field.value}
									onChange={field.onChange}
									placeholder="cc@example.com"
									disabled={isSending}
								/>
							)}
						/>
					</div>
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

					<div className="mt-2 rounded-lg border border-mail-border/20 bg-mail-accent/30 bg-offset-light/60 p-3">
						<p className="mb-1.5 font-medium text-[11px] text-mail-muted uppercase tracking-wider">
							Forwarded message
						</p>
						<div className="flex flex-col gap-0.5 text-label-xs text-mail-muted">
							<span>
								<span className="font-semibold">From:</span> {originalFrom}
							</span>
							<span>
								<span className="font-semibold">Date:</span> {originalDate}
							</span>
							<span>
								<span className="font-semibold">Subject:</span>{" "}
								{originalSubject}
							</span>
						</div>
						{originalBodyText && (
							<p className="mt-2 line-clamp-3 whitespace-pre-wrap text-label-xs text-mail-muted leading-relaxed">
								{originalBodyText}
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between rounded-b-xl border-mail-border border-t bg-offset-light/30 px-4 py-2.5">
					<div className="flex items-center gap-2">
						<button
							type="submit"
							disabled={!canSend}
							className="flex items-center gap-1.5 rounded-lg bg-mail-primary px-4 py-1.5 font-semibold text-label-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
						>
							{isSending ? <span>Sending…</span> : <span>Forward</span>}
						</button>

						<button
							type="button"
							className={cn(
								"rounded-lg p-1.5 text-mail-muted hover:bg-[var(--inbox-hover)] hover:text-mail-foreground",
								showToolbar &&
									"bg-[var(--inbox-muted-bg)] text-mail-foreground",
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
			</form>
		</div>
	);
};
