"use client";

import { cn } from "@reloop/ui/cn";
import { FileText, HardDriveDownload, Image as ImageIcon } from "lucide-react";

export interface AttachmentItem {
	id?: string;
	name: string;
	size: string;
	contentType?: string;
	inboundEmailId?: string;
	messageId?: string;
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

const formatFileSize = (size: string | number) => {
	if (typeof size === "number") {
		const mb = size / (1024 * 1024);
		if (mb >= 0.01) return `${mb.toFixed(1)} MB`;
		const kb = size / 1024;
		return `${kb.toFixed(1)} KB`;
	}
	return size;
};

const FileTypeIcon = ({ filename }: { filename: string }) => {
	const extension = filename.split(".").pop()?.toLowerCase();

	switch (extension) {
		case "pdf":
			return (
				<svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
					<title>PDF</title>
					<path
						fill="#F43F5E"
						d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5zM5.5 9.5c.4 0 .7.1.9.3.3.2.4.5.4.9 0 .3-.1.6-.3.8-.2.2-.5.3-.9.3H4.8v1.2H3.7V9.5h1.8zm0 1.5c.15 0 .25-.04.32-.1.07-.07.1-.16.1-.28 0-.12-.03-.2-.1-.27-.07-.06-.17-.1-.32-.1H4.8v.75h.7zm3.2-1.5c.5 0 .9.12 1.15.35.26.23.4.56.4.98 0 .43-.13.77-.4 1-.26.24-.65.36-1.15.36H7.5V9.5h1.2zm0 2.1c.22 0 .4-.05.52-.16.12-.1.18-.27.18-.48 0-.2-.06-.36-.18-.47-.12-.1-.3-.16-.52-.16H8.6v1.27h.1zm3.3-2.1v.85h1.4v.7h-1.4v1.55h-1.1V9.5h2.5z"
					/>
				</svg>
			);
		case "doc":
		case "docx":
			return (
				<svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
					<title>Word</title>
					<path
						fill="#3B82F6"
						d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5zM4.2 9.2l1.1 4.3h1.1l.85-3.2.85 3.2h1.1l1.1-4.3h-1.15l-.6 2.7-.75-2.7H7.1l-.75 2.7-.6-2.7H4.2z"
					/>
				</svg>
			);
		case "fig":
		case "figma":
			return (
				<svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
					<title>Figma</title>
					<path
						fill="#F97316"
						d="M5.5 1A2.5 2.5 0 0 0 3 3.5v1A2.5 2.5 0 0 0 5.5 7H8V1H5.5zm2.5 6H5.5A2.5 2.5 0 0 0 3 9.5v0A2.5 2.5 0 0 0 5.5 12H8V7zm0 5H5.5A2.5 2.5 0 0 0 3 14.5 2.5 2.5 0 0 0 5.5 17H8v-5zm0-5h2.5A2.5 2.5 0 0 1 13 9.5 2.5 2.5 0 0 1 10.5 7H8v0z"
						transform="scale(0.85) translate(1, -0.5)"
					/>
					<circle cx="11" cy="9.5" r="2.5" fill="#A855F7" />
				</svg>
			);
		case "jpg":
		case "jpeg":
		case "png":
		case "gif":
		case "webp":
		case "svg":
			return <ImageIcon className="h-4 w-4 shrink-0 text-[#8B5CF6]" />;
		default:
			return <FileText className="h-4 w-4 shrink-0 text-[#8B5CF6]" />;
	}
};

export const downloadAttachment = async (
	file: AttachmentItem,
	messageId?: string,
) => {
	const msgId = messageId || file.messageId || file.inboundEmailId;
	if (!msgId || !file.id) return;

	const url = `/api/inbox/v1/messages/${msgId}/attachments/${file.id}`;
	const res = await fetch(url);
	if (!res.ok) return;

	const meta = (await res.json()) as {
		filename: string;
		storagePath: string;
		contentType: string;
	};

	if (meta.storagePath?.startsWith("http")) {
		const a = document.createElement("a");
		a.href = meta.storagePath;
		a.download = meta.filename || file.name;
		a.target = "_blank";
		a.rel = "noopener noreferrer";
		a.click();
		return;
	}

	const a = document.createElement("a");
	a.href = url;
	a.download = meta.filename || file.name;
	a.click();
};

/**
 * Zero-style horizontal attachment chips with file-type icons.
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
			{showLabel && (
				<div className="mb-2 flex items-center gap-2">
					<span className="font-medium text-mail-foreground text-sm">
						{label} <span className="text-[#8D8D8D]">[{visible.length}]</span>
					</span>
				</div>
			)}
			<div className="flex flex-wrap items-center gap-2">
				{visible.map((file, index) => (
					<div
						key={file.id || `${file.name}-${index}`}
						className="flex items-center"
					>
						<button
							type="button"
							onClick={() => void handleDownload(file)}
							className="flex cursor-pointer items-center gap-1.5 rounded-[5px] bg-[#FAFAFA] px-1.5 py-1 font-medium text-sm transition-colors hover:bg-[#F0F0F0] dark:bg-[#262626] dark:hover:bg-[#303030]"
						>
							<FileTypeIcon filename={file.name} />
							<span
								className="max-w-[15ch] truncate text-mail-foreground text-sm"
								title={file.name}
							>
								{file.name}
							</span>
							<span className="whitespace-nowrap text-[#929292] text-sm">
								{formatFileSize(file.size)}
							</span>
						</button>
						<button
							type="button"
							onClick={() => void handleDownload(file)}
							className="flex cursor-pointer items-center gap-1 rounded-[5px] px-1.5 py-1 text-sm"
							aria-label={`Download ${file.name}`}
						>
							<HardDriveDownload className="h-4 w-4 text-[#929292]" />
						</button>
						{index < visible.length - 1 && (
							<div className="mx-0.5 h-2 w-px bg-[#E0E0E0] dark:bg-[#424242]" />
						)}
					</div>
				))}
			</div>
		</div>
	);
};
