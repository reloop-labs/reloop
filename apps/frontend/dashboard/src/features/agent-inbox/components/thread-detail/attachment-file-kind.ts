export type AttachmentFileKind =
	| "pdf"
	| "doc"
	| "xls"
	| "ppt"
	| "img"
	| "zip"
	| "file";

const KIND_FROM_EXT: Record<string, AttachmentFileKind> = {
	pdf: "pdf",
	doc: "doc",
	docx: "doc",
	xls: "xls",
	xlsx: "xls",
	csv: "xls",
	ppt: "ppt",
	pptx: "ppt",
	png: "img",
	jpg: "img",
	jpeg: "img",
	gif: "img",
	webp: "img",
	svg: "img",
	avif: "img",
	zip: "zip",
	rar: "zip",
	"7z": "zip",
};

export function extensionOf(filename: string): string {
	const part = filename.split(".").pop()?.toLowerCase() ?? "";
	return part === filename.toLowerCase() ? "" : part;
}

export function attachmentFileKind(
	filename: string,
	contentType?: string,
): AttachmentFileKind {
	const ext = extensionOf(filename);
	if (ext && KIND_FROM_EXT[ext]) return KIND_FROM_EXT[ext];
	const type = (contentType ?? "").toLowerCase();
	if (type.includes("pdf")) return "pdf";
	if (type.startsWith("image/")) return "img";
	if (type.includes("spreadsheet") || type.includes("excel")) return "xls";
	if (type.includes("presentation") || type.includes("powerpoint")) {
		return "ppt";
	}
	if (type.includes("word") || type.includes("msword")) return "doc";
	if (type.includes("zip") || type.includes("compressed")) return "zip";
	return "file";
}

export function attachmentKindLabel(kind: AttachmentFileKind): string {
	switch (kind) {
		case "pdf":
			return "PDF";
		case "doc":
			return "DOC";
		case "xls":
			return "XLS";
		case "ppt":
			return "PPT";
		case "img":
			return "IMG";
		case "zip":
			return "ZIP";
		default:
			return "FILE";
	}
}
