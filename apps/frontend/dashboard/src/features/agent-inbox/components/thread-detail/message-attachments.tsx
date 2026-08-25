import { cn } from "@reloop/ui/cn";
import { apiFetch } from "#/features/agent-inbox/lib/api-fetch";
import {
	type AttachmentFileKind,
	attachmentFileKind,
	attachmentKindLabel,
} from "./attachment-file-kind";

export interface AttachmentItem {
	id?: string;
	name: string;
	size: string;
	contentType?: string;
	inboundEmailId?: string;
	messageId?: string;
	storagePath?: string;
	isInline?: boolean;
}

interface MessageAttachmentsProps {
	attachments: AttachmentItem[];
	messageId?: string;
	onDownload?: (attachment: AttachmentItem) => void;
	/** When true, show a section label like "Attachments [N]" */
	showLabel?: boolean;
	label?: string;
	className?: string;
}

const KIND_ACCENT: Record<AttachmentFileKind, string> = {
	pdf: "#E53935",
	doc: "#1A73E8",
	xls: "#188038",
	ppt: "#E8710A",
	img: "#8B5CF6",
	zip: "#5F6368",
	file: "#5F6368",
};

function FileKindGlyph({
	kind,
	className,
}: {
	kind: AttachmentFileKind;
	className?: string;
}) {
	const fill = KIND_ACCENT[kind];
	return (
		<svg
			viewBox="0 0 16 16"
			className={cn("h-4 w-4 shrink-0", className)}
			aria-hidden
		>
			<title>{attachmentKindLabel(kind)}</title>
			<path
				fill={fill}
				d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5z"
			/>
			<text
				x="8"
				y="12.2"
				textAnchor="middle"
				fill="white"
				fontSize="4.2"
				fontWeight="700"
				fontFamily="ui-sans-serif, system-ui, sans-serif"
			>
				{attachmentKindLabel(kind).slice(0, 3)}
			</text>
		</svg>
	);
}

function previewUrlFor(file: AttachmentItem): string | null {
	const path = file.storagePath?.trim();
	if (!path) return null;
	if (path.startsWith("http://") || path.startsWith("https://")) return path;
	if (path.startsWith("uploads/")) {
		return `/api/upload/v1/files/content?path=${encodeURIComponent(path)}`;
	}
	return null;
}

function triggerDownload(href: string, filename: string, revoke?: string) {
	const a = document.createElement("a");
	a.href = href;
	a.download = filename;
	if (href.startsWith("http")) {
		a.target = "_blank";
		a.rel = "noopener noreferrer";
	}
	a.click();
	if (revoke) URL.revokeObjectURL(revoke);
}

export const downloadAttachment = async (
	file: AttachmentItem,
	messageId?: string,
) => {
	const path = file.storagePath?.trim();
	if (path?.startsWith("http://") || path?.startsWith("https://")) {
		triggerDownload(path, file.name);
		return;
	}
	if (path?.startsWith("uploads/")) {
		const fileRes = await apiFetch(
			`/api/upload/v1/files/content?path=${encodeURIComponent(path)}`,
		);
		if (!fileRes.ok) return;
		const blob = await fileRes.blob();
		const objectUrl = URL.createObjectURL(blob);
		triggerDownload(objectUrl, file.name, objectUrl);
		return;
	}

	const msgId = messageId || file.messageId || file.inboundEmailId;
	if (!msgId || !file.id) return;

	const url = `/api/inbox/v1/messages/${msgId}/attachments/${file.id}`;
	const res = await apiFetch(url);
	if (!res.ok) return;

	const meta = (await res.json()) as {
		filename: string;
		storagePath: string;
		contentType: string;
	};

	if (meta.storagePath?.startsWith("http")) {
		triggerDownload(meta.storagePath, meta.filename || file.name);
		return;
	}

	if (meta.storagePath?.startsWith("uploads/")) {
		const fileRes = await apiFetch(
			`/api/upload/v1/files/content?path=${encodeURIComponent(meta.storagePath)}`,
		);
		if (!fileRes.ok) return;
		const blob = await fileRes.blob();
		const objectUrl = URL.createObjectURL(blob);
		triggerDownload(objectUrl, meta.filename || file.name, objectUrl);
		return;
	}

	triggerDownload(url, meta.filename || file.name);
};

function AttachmentCard({
	file,
	onDownload,
}: {
	file: AttachmentItem;
	onDownload: (file: AttachmentItem) => void;
}) {
	const kind = attachmentFileKind(file.name, file.contentType);
	const label = attachmentKindLabel(kind);
	const previewUrl = kind === "img" ? previewUrlFor(file) : null;

	return (
		<div className="relative w-[168px] shrink-0">
			<button
				type="button"
				onClick={() => onDownload(file)}
				aria-label={`Download ${file.name}`}
				title={file.name}
				className={cn(
					"relative flex w-full flex-col overflow-hidden rounded-[10px] bg-white text-left",
					"shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-black/8",
					"transition-[box-shadow,transform] duration-150 ease-out",
					"hover:shadow-[0_6px_16px_rgba(15,23,42,0.1)]",
					"active:scale-[0.97]",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-strong-950",
					"dark:bg-[#1c1c1c] dark:ring-white/10",
				)}
				style={{
					clipPath:
						"polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
				}}
			>
				<div className="relative flex h-[92px] items-center justify-center bg-white dark:bg-[#222]">
					{previewUrl ? (
						<img
							src={previewUrl}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<span className="rounded-md bg-[#E8E8E8] px-2.5 py-1 font-semibold text-[#9A9A9A] text-[13px] tracking-wide dark:bg-white/10 dark:text-white/40">
							{label}
						</span>
					)}
				</div>
				<div className="flex h-[36px] items-center gap-1.5 border-black/6 border-t bg-[#F3F3F3] px-2.5 dark:border-white/8 dark:bg-[#2a2a2a]">
					<FileKindGlyph kind={kind} />
					<span className="min-w-0 truncate font-medium text-[#3C4043] text-[12.5px] dark:text-white/80">
						{file.name}
					</span>
				</div>
			</button>
			<span
				aria-hidden
				className="pointer-events-none absolute right-0 bottom-0 size-[14px]"
			>
				<svg viewBox="0 0 14 14" className="size-full" aria-hidden>
					<path d="M14 0v14H0z" fill="#E24B3A" />
					<path
						d="M14 0 0 14"
						stroke="rgba(255,255,255,0.35)"
						strokeWidth="0.6"
					/>
				</svg>
			</span>
		</div>
	);
}

/**
 * Gmail-style document preview cards for attachments on a message.
 */
export const MessageAttachments = ({
	attachments,
	messageId,
	onDownload,
	showLabel = false,
	label = "Attachments",
	className,
}: MessageAttachmentsProps) => {
	const visible = attachments.filter((a) => !a.isInline);
	if (visible.length === 0) return null;

	const handleDownload = async (file: AttachmentItem) => {
		if (onDownload) {
			onDownload(file);
			return;
		}
		await downloadAttachment(file, messageId);
	};

	return (
		<div className={cn("w-full", className)}>
			{showLabel ? (
				<div className="mb-2.5 flex items-center gap-2">
					<span className="font-medium text-mail-foreground text-sm">
						{label} <span className="text-[#8D8D8D]">[{visible.length}]</span>
					</span>
				</div>
			) : null}
			<div className="flex flex-wrap items-start gap-3">
				{visible.map((file, index) => (
					<AttachmentCard
						key={file.id || `${file.name}-${index}`}
						file={file}
						onDownload={(item) => void handleDownload(item)}
					/>
				))}
			</div>
		</div>
	);
};
