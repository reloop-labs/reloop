export type OutboundAttachment = {
	id: string;
	filename: string;
	contentType: string;
	size: number;
	storagePath: string;
	contentDisposition: string | null;
	contentId: string | null;
};

export function mapEmailLogAttachments(value: unknown): OutboundAttachment[] {
	if (!Array.isArray(value)) return [];
	const out: OutboundAttachment[] = [];
	for (const raw of value) {
		if (!raw || typeof raw !== "object") continue;
		const att = raw as Record<string, unknown>;
		const filename =
			(typeof att.filename === "string" && att.filename) ||
			(typeof att.name === "string" && att.name) ||
			"attachment";
		const storagePath =
			(typeof att.storagePath === "string" && att.storagePath) ||
			(typeof att.path === "string" && att.path) ||
			"";
		out.push({
			id: typeof att.id === "string" ? att.id : `outatt_${out.length}`,
			filename,
			contentType:
				(typeof att.contentType === "string" && att.contentType) ||
				(typeof att.content_type === "string" && att.content_type) ||
				"application/octet-stream",
			size: typeof att.size === "number" ? att.size : 0,
			storagePath,
			contentDisposition:
				typeof att.contentDisposition === "string"
					? att.contentDisposition
					: "attachment",
			contentId:
				(typeof att.contentId === "string" && att.contentId) ||
				(typeof att.content_id === "string" && att.content_id) ||
				null,
		});
	}
	return out;
}
