import { createId } from "@paralleldrive/cuid2";

export type EmailLogAttachment = {
	id: string;
	filename: string;
	contentType: string;
	size: number;
	storagePath: string;
	contentDisposition: "attachment" | "inline";
	contentId: string | null;
};

export type SendAttachmentInput = {
	filename?: string;
	path?: string;
	content_type?: string;
	content_id?: string;
};

export function serializeSendAttachments(
	attachments: SendAttachmentInput[] | undefined,
): EmailLogAttachment[] {
	if (!attachments?.length) return [];
	const out: EmailLogAttachment[] = [];
	for (const att of attachments) {
		const storagePath = (att.path ?? "").trim();
		const filename = (att.filename ?? "").trim() || "attachment";
		if (!storagePath && !att.filename) continue;
		out.push({
			id: `outatt_${createId()}`,
			filename,
			contentType: att.content_type?.trim() || "application/octet-stream",
			size: 0,
			storagePath,
			contentDisposition: att.content_id ? "inline" : "attachment",
			contentId: att.content_id?.trim() || null,
		});
	}
	return out;
}
