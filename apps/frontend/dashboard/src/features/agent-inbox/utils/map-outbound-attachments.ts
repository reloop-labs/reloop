import type { InboundAttachment } from "../types";

export type OutboundAttachmentInput = {
	id?: string;
	filename?: string;
	name?: string;
	contentType?: string;
	content_type?: string;
	size?: number | string;
	contentDisposition?: string | null;
	contentId?: string | null;
	isInline?: boolean;
};

/**
 * Only Content-Disposition: inline (or an explicit flag) is a CID image.
 * Many real file attachments also have a Content-ID; treating that as inline
 * hid the paperclip on the Sent list.
 */
export function isInlineAttachment(
	att: Pick<OutboundAttachmentInput, "isInline" | "contentDisposition">,
): boolean {
	if (att.isInline === true) return true;
	return att.contentDisposition?.toLowerCase() === "inline";
}

export function hasVisibleAttachments(
	attachments: Array<{ isInline?: boolean }> | undefined,
): boolean {
	return (attachments ?? []).some((att) => att.isInline !== true);
}

export function mapOutboundAttachments(
	attachments: OutboundAttachmentInput[] | undefined,
): InboundAttachment[] {
	if (!attachments?.length) return [];
	return attachments.map((att) => {
		const size =
			typeof att.size === "number"
				? `${(att.size / 1024).toFixed(1)} KB`
				: att.size || "";
		return {
			name: att.filename || att.name || "Attachment",
			size,
			contentType: att.contentType || att.content_type,
			isInline: isInlineAttachment(att),
		};
	});
}
