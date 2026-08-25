import { cn } from "@reloop/ui/cn";
import { HardDriveDownload } from "lucide-react";
import { apiFetch } from "#/features/agent-inbox/lib/api-fetch";
import { FileTypeIcon } from "./file-type-icon";

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

const formatFileSize = (size: string | number) => {
	if (typeof size === "number") {
		const mb = size / (1024 * 1024);
		if (mb >= 0.01) return `${mb.toFixed(1)} MB`;
		const kb = size / 1024;
		return `${kb.toFixed(1)} KB`;
	}
	return size;
};

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

/**
 * Horizontal attachment chips with file-type icons.
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
				<div className="mb-2 flex items-center gap-2">
					<span className="font-medium text-mail-foreground text-sm">
						{label} <span className="text-[#8D8D8D]">[{visible.length}]</span>
					</span>
				</div>
			) : null}
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
							{file.size ? (
								<span className="whitespace-nowrap text-[#929292] text-sm">
									{formatFileSize(file.size)}
								</span>
							) : null}
						</button>
						<button
							type="button"
							onClick={() => void handleDownload(file)}
							className="flex cursor-pointer items-center gap-1 rounded-[5px] px-1.5 py-1 text-sm"
							aria-label={`Download ${file.name}`}
						>
							<HardDriveDownload className="h-4 w-4 text-[#929292]" />
						</button>
						{index < visible.length - 1 ? (
							<div className="mx-0.5 h-2 w-px bg-[#E0E0E0] dark:bg-[#424242]" />
						) : null}
					</div>
				))}
			</div>
		</div>
	);
};
