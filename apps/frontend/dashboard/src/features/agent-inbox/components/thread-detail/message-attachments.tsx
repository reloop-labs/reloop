import { cn } from "@reloop/ui/cn";
import { toast } from "@reloop/ui/toast";
import { HardDriveDownload } from "lucide-react";
import { apiFetch, responseError } from "#/features/agent-inbox/lib/api-fetch";
import { isInlineAttachment } from "#/features/agent-inbox/utils/map-outbound-attachments";
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

function triggerDownload(href: string, filename: string) {
	const a = document.createElement("a");
	a.href = href;
	a.download = filename;
	if (href.startsWith("http")) {
		a.target = "_blank";
		a.rel = "noopener noreferrer";
	}
	a.click();
}

async function downloadBlob(url: string, filename: string): Promise<void> {
	const res = await apiFetch(url);
	if (!res.ok) throw await responseError(res, "Could not download attachment");
	const objectUrl = URL.createObjectURL(await res.blob());
	triggerDownload(objectUrl, filename);
	// Revoke after the click has been handled, or some browsers cancel it.
	setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

/** URL that returns an attachment's bytes (inbound or sent). */
export const attachmentContentUrl = (
	messageId: string,
	attachmentId: string,
	inline = false,
) =>
	`/api/inbox/v1/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}/content${inline ? "?inline=true" : ""}`;

export const downloadAttachment = async (
	file: AttachmentItem,
	messageId?: string,
): Promise<void> => {
	try {
		const path = file.storagePath?.trim();
		if (path?.startsWith("http://") || path?.startsWith("https://")) {
			triggerDownload(path, file.name);
			return;
		}
		if (path?.startsWith("uploads/")) {
			await downloadBlob(
				`/api/upload/v1/files/content?path=${encodeURIComponent(path)}`,
				file.name,
			);
			return;
		}
		const msgId = file.inboundEmailId || file.messageId || messageId;
		if (!msgId || !file.id) {
			throw new Error("This attachment is not available for download");
		}
		await downloadBlob(attachmentContentUrl(msgId, file.id), file.name);
	} catch (err) {
		toast.error(
			err instanceof Error ? err.message : "Could not download attachment",
		);
	}
};

/** Attachment as the API returns it (inbound row or sent-log entry). */
export interface RawMessageAttachment {
	id?: string;
	filename?: string;
	name?: string;
	size?: number | string;
	contentType?: string;
	storagePath?: string;
	contentDisposition?: string | null;
	contentId?: string | null;
	isInline?: boolean;
	inboundEmailId?: string;
}

const normalizeCid = (cid: string) =>
	cid.trim().replace(/^<|>$/g, "").toLowerCase();

/** `cid:` references in an HTML body, normalized. */
const referencedCids = (html: string | null | undefined): Set<string> =>
	new Set(
		Array.from((html ?? "").matchAll(/cid:([^"'\s)>]+)/gi), (m) => {
			const raw = m[1] ?? "";
			try {
				return normalizeCid(decodeURIComponent(raw));
			} catch {
				return normalizeCid(raw);
			}
		}),
	);

/** Where an attachment's bytes can be fetched from the dashboard. */
function attachmentSrc(
	att: RawMessageAttachment,
	messageId: string | undefined,
	inline: boolean,
): string | undefined {
	const path = att.storagePath?.trim();
	if (path?.startsWith("https://")) return path;
	if (path?.startsWith("uploads/")) {
		return `/api/upload/v1/files/content?path=${encodeURIComponent(path)}`;
	}
	const msgId = att.inboundEmailId || messageId;
	return msgId && att.id
		? attachmentContentUrl(msgId, att.id, inline)
		: undefined;
}

/**
 * Normalize API attachments for the chips. Parts shown inside the body
 * (Content-Disposition: inline, or a Content-ID the HTML references) are
 * marked inline so they don't also appear as chips.
 */
export function toAttachmentItems(
	attachments: RawMessageAttachment[] | undefined,
	opts: { messageId?: string; html?: string | null },
): AttachmentItem[] {
	const cids = referencedCids(opts.html);
	return (attachments ?? []).map((att) => ({
		id: att.id,
		name: att.filename || att.name || "Attachment",
		size:
			typeof att.size === "number" ? formatFileSize(att.size) : att.size || "",
		contentType: att.contentType,
		storagePath: att.storagePath,
		inboundEmailId: att.inboundEmailId || opts.messageId,
		messageId: opts.messageId,
		isInline:
			isInlineAttachment(att) ||
			(!!att.contentId && cids.has(normalizeCid(att.contentId))),
	}));
}

/** Content-ID → URL map so `cid:` images in the body render. */
export function inlineImageUrls(
	attachments: RawMessageAttachment[] | undefined,
	messageId: string | undefined,
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const att of attachments ?? []) {
		if (!att.contentId) continue;
		const src = attachmentSrc(att, messageId, true);
		if (src) out[normalizeCid(att.contentId)] = src;
	}
	return out;
}

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
