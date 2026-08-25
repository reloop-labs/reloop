import { apiFetch } from "#/features/agent-inbox/lib/api-fetch";

export type ComposeAttachment = {
	id: string;
	name: string;
	size: string;
	url: string;
	path: string;
	content_type: string;
	isUploading?: boolean;
};

export const formatBytes = (bytes: number, decimals = 1) => {
	if (!bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export async function uploadComposeFile(file: File): Promise<{
	url: string;
	path: string;
}> {
	const formData = new FormData();
	formData.append("file", file);
	const res = await apiFetch("/api/upload/v1/upload", {
		method: "POST",
		body: formData,
	});
	if (!res.ok) throw new Error("Upload failed");
	return (await res.json()) as { url: string; path: string };
}

/** Handle mail can load: object key locally, public S3 URL in production. */
export function attachmentRefForSend(attachment: ComposeAttachment): string {
	const url = attachment.url.trim();
	if (url.startsWith("https://")) {
		try {
			const host = new URL(url).hostname.toLowerCase();
			if (
				host !== "localhost" &&
				host !== "127.0.0.1" &&
				!host.endsWith(".localhost")
			) {
				return url;
			}
		} catch {
			/* use the storage key */
		}
	}
	return attachment.path || url;
}

export function toSendAttachments(attachments: ComposeAttachment[]) {
	return attachments
		.filter((a) => !a.isUploading && (a.url || a.path))
		.map((a) => ({
			filename: a.name,
			path: attachmentRefForSend(a),
			content_type: a.content_type,
		}));
}
