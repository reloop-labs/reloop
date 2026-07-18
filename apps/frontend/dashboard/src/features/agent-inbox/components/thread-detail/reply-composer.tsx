import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion, useReducedMotion } from "framer-motion";
import { Paperclip } from "lucide-react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { extractBareEmail, extractDisplayName } from "../../lib/email-address";
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

type ReplyMode = "reply" | "replyAll";

interface ReplyComposerProps {
	toName: string;
	toEmail: string;
	fromEmail: string;
	mode?: ReplyMode;
	canReplyAll?: boolean;
	/** Plain-text seed (e.g. agent suggested reply) */
	initialContent?: string;
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

const modKey =
	typeof navigator !== "undefined" &&
	/Mac|iPhone|iPad|iPod/.test(navigator.platform)
		? "⌘"
		: "Ctrl";

const easeOut = [0.22, 1, 0.36, 1] as const;

function ModeSwitcher({
	mode,
	canReplyAll,
	onChange,
}: {
	mode: ReplyMode;
	canReplyAll: boolean;
	onChange: (mode: ReplyMode) => void;
}) {
	const replyRef = useRef<HTMLButtonElement>(null);
	const replyAllRef = useRef<HTMLButtonElement>(null);
	const [pill, setPill] = useState({ left: 0, width: 0 });

	const measure = useCallback(() => {
		const el = mode === "reply" ? replyRef.current : replyAllRef.current;
		if (!el) return;
		setPill({ left: el.offsetLeft, width: el.offsetWidth });
	}, [mode]);

	useLayoutEffect(() => {
		measure();
	}, [measure]);

	useEffect(() => {
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [measure]);

	return (
		<div
			className="relative inline-flex h-7 items-center rounded-lg bg-[var(--inbox-muted-bg)] p-0.5"
			role="group"
			aria-label="Reply mode"
		>
			<motion.span
				aria-hidden
				className="absolute top-0.5 bottom-0.5 rounded-md bg-panel-light shadow-sm dark:bg-panel-dark"
				initial={false}
				animate={{ left: pill.left, width: pill.width }}
				transition={{ type: "spring", bounce: 0, duration: 0.28 }}
			/>
			<button
				ref={replyRef}
				type="button"
				onClick={() => onChange("reply")}
				aria-pressed={mode === "reply"}
				className={cn(
					"relative z-10 inline-flex h-6 items-center gap-1 rounded-md px-2 font-medium text-[12px] transition-colors duration-200",
					mode === "reply"
						? "text-mail-foreground"
						: "text-mail-muted hover:text-mail-foreground",
				)}
			>
				<Icon name="reply" className="h-3 w-3" />
				Reply
			</button>
			{canReplyAll && (
				<button
					ref={replyAllRef}
					type="button"
					onClick={() => onChange("replyAll")}
					aria-pressed={mode === "replyAll"}
					className={cn(
						"relative z-10 inline-flex h-6 items-center gap-1 rounded-md px-2 font-medium text-[12px] transition-colors duration-200",
						mode === "replyAll"
							? "text-mail-foreground"
							: "text-mail-muted hover:text-mail-foreground",
					)}
				>
					Reply all
				</button>
			)}
		</div>
	);
}

export const ReplyComposer = ({
	toName,
	toEmail,
	fromEmail,
	mode: modeProp = "reply",
	canReplyAll = true,
	initialContent = "",
	onModeChange,
	onSend,
	onClose,
}: ReplyComposerProps) => {
	const reduceMotion = useReducedMotion();
	const [mode, setMode] = useState<ReplyMode>(modeProp);
	const bareTo = extractBareEmail(toEmail) || toEmail;
	const displayName =
		extractDisplayName(toName) ||
		toName.trim() ||
		bareTo.split("@")[0] ||
		bareTo;
	const bareFrom = extractBareEmail(fromEmail) || fromEmail;

	const fileInputRef = useRef<HTMLInputElement>(null);
	const editorRef = useRef<ComposeBodyEditorHandle>(null);
	const seedHtml = initialContent ? plainToHtml(initialContent) : "";
	const [htmlBody, setHtmlBody] = useState(seedHtml);
	const [textBody, setTextBody] = useState(initialContent);
	const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
	const htmlRef = useRef(htmlBody);
	const textRef = useRef(textBody);
	htmlRef.current = htmlBody;
	textRef.current = textBody;

	useEffect(() => {
		setMode(modeProp);
	}, [modeProp]);

	useEffect(() => {
		const id = window.setTimeout(() => {
			editorRef.current?.editor?.commands.focus("end");
		}, 120);
		return () => window.clearTimeout(id);
	}, []);

	const changeMode = (next: ReplyMode) => {
		setMode(next);
		onModeChange?.(next);
	};

	const send = useCallback(async () => {
		if (!textRef.current.trim()) return;
		if (attachments.some((a) => a.isUploading)) {
			toast.error("Please wait for attachments to finish uploading.");
			return;
		}
		const exported = (await editorRef.current?.getEmail()) ?? {
			html: htmlRef.current,
			text: textRef.current,
		};
		onSend({
			text: (exported.text || textRef.current).trim(),
			html: exported.html || htmlRef.current,
			attachments: toSendAttachments(attachments),
		});
	}, [attachments, onSend]);

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
		<motion.div
			initial={
				reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(2px)" }
			}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			transition={{ duration: 0.32, ease: easeOut }}
			className="shrink-0"
		>
			<div
				{...getRootProps()}
				className={cn(
					"relative border-mail-border/50 border-t bg-panel-light dark:bg-panel-dark",
					"shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)]",
					isDragActive && "ring-2 ring-inset ring-mail-foreground/20",
				)}
			>
			<input {...getInputProps()} />

			{isDragActive && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-panel-light/80 text-mail-muted text-sm backdrop-blur-[1px] dark:bg-panel-dark/80"
				>
					Drop files to attach
				</motion.div>
			)}

			<div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
				<ModeSwitcher
					mode={mode}
					canReplyAll={canReplyAll}
					onChange={changeMode}
				/>

				<motion.div
					key={bareTo}
					initial={reduceMotion ? false : { opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.22, ease: easeOut, delay: 0.04 }}
					className="min-w-0 flex-1 truncate text-[12px] text-mail-muted"
				>
					<span className="text-mail-muted">to </span>
					<span className="font-medium text-mail-foreground">{displayName}</span>
					{bareTo ? <span className="text-mail-muted"> · {bareTo}</span> : null}
				</motion.div>

				<button
					type="button"
					onClick={onClose}
					className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97]"
					aria-label="Close reply"
				>
					<Icon name="cross" className="h-3.5 w-3.5" />
				</button>
			</div>

			<div className="px-2">
				<ComposeBodyEditor
					ref={editorRef}
					content={seedHtml}
					placeholder={`Write a ${mode === "replyAll" ? "reply to all" : "reply"}…`}
					showToolbar={false}
					className="compose-email-editor__content min-h-[120px] max-h-[280px] overflow-y-auto px-3 py-2"
					onUpdate={(html, text) => {
						setHtmlBody(html);
						setTextBody(text);
					}}
					onModEnter={() => void send()}
				/>
			</div>

			{attachments.length > 0 && (
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2, ease: easeOut }}
					className="flex flex-wrap gap-1.5 px-4 pb-2"
				>
					{attachments.map((file) => (
						<div
							key={file.id}
							className="inline-flex h-7 max-w-[200px] items-center gap-1.5 rounded-lg border border-mail-border/40 bg-[var(--inbox-muted-bg)] px-2 text-[11px]"
						>
							<Paperclip className="h-3 w-3 shrink-0 text-mail-muted" />
							<span className="min-w-0 truncate font-medium text-mail-foreground">
								{file.name}
							</span>
							<span className="shrink-0 text-mail-muted">{file.size}</span>
							{file.isUploading ? (
								<span className="shrink-0 text-mail-muted">…</span>
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
						</div>
					))}
				</motion.div>
			)}

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

				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-8 items-center rounded-lg px-2.5 font-medium text-[12px] text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-danger-bg)] hover:text-[var(--inbox-danger-fg)] active:scale-[0.97]"
					>
						Discard
					</button>
					<button
						type="button"
						onClick={() => void send()}
						disabled={!canSend}
						className={cn(
							"inline-flex h-8 items-center gap-2 rounded-lg bg-mail-primary px-3 font-semibold text-[12px] text-panel-light transition-[transform,opacity] duration-150",
							"hover:opacity-90 active:scale-[0.97]",
							"disabled:pointer-events-none disabled:opacity-35",
							"dark:text-black",
						)}
					>
						<span>Send</span>
						<span className="hidden items-center gap-0.5 font-normal opacity-70 sm:inline-flex">
							<span className="rounded border border-white/25 px-1 text-[10px] leading-4 dark:border-black/25">
								{modKey}
							</span>
							<span className="rounded border border-white/25 px-1 text-[10px] leading-4 dark:border-black/25">
								↵
							</span>
						</span>
					</button>
				</div>
			</div>
			</div>
		</motion.div>
	);
};

/** Collapsed dock — same shell language as the open composer. */
export function ReplyComposerAffordance({
	toName,
	onReply,
	onReplyAll,
}: {
	toName: string;
	onReply: () => void;
	onReplyAll?: () => void;
}) {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	return (
		<div className="shrink-0 border-mail-border/50 border-t bg-panel-light px-4 py-3 dark:bg-panel-dark">
			<div
				className="relative flex items-center gap-2"
				onPointerLeave={() => setHoverIdx(undefined)}
			>
				<button
					ref={(el) => {
						if (el) buttonRefs.current[0] = el;
					}}
					type="button"
					onPointerEnter={() => setHoverIdx(0)}
					onClick={onReply}
					className={cn(
						"relative z-10 group flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3",
						"text-left transition-[color,transform] duration-150 ease-out",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mail-foreground/15",
						"active:scale-[0.99]",
					)}
				>
					<span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--inbox-muted-bg)] text-mail-muted">
						<Icon name="reply" className="h-3.5 w-3.5" />
					</span>
					<span className="min-w-0 flex-1 truncate text-mail-muted text-sm">
						Reply to{" "}
						<span className="font-medium text-mail-foreground">{toName}</span>
						…
					</span>
					<span className="hidden shrink-0 text-[11px] text-mail-muted sm:inline">
						R
					</span>
				</button>
				{onReplyAll && (
					<button
						ref={(el) => {
							if (el) buttonRefs.current[1] = el;
						}}
						type="button"
						onPointerEnter={() => setHoverIdx(1)}
						onClick={onReplyAll}
						className="relative z-10 inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 font-medium text-[12px] text-mail-muted transition-[color,transform] duration-150 hover:text-mail-foreground active:scale-[0.97]"
						aria-label="Reply all"
					>
						Reply all
					</button>
				)}
				<AnimatedHoverBackground
					rect={currentRect}
					tabElement={currentTab}
					className="rounded-xl !bg-[var(--inbox-hover)]"
				/>
			</div>
		</div>
	);
}
