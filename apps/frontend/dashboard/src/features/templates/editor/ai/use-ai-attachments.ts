import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { AiAttachment } from "./types";

function uid() {
	return `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useAiAttachments() {
	const [attachments, setAttachments] = useState<AiAttachment[]>([]);
	const [uploading, setUploading] = useState(false);

	const remove = useCallback((id: string) => {
		setAttachments((prev) => {
			const hit = prev.find((a) => a.id === id);
			if (hit?.previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(hit.previewUrl);
			}
			return prev.filter((a) => a.id !== id);
		});
	}, []);

	const clear = useCallback(() => {
		setAttachments((prev) => {
			for (const a of prev) {
				if (a.previewUrl?.startsWith("blob:")) {
					URL.revokeObjectURL(a.previewUrl);
				}
			}
			return [];
		});
	}, []);

	const addFiles = useCallback(async (files: FileList | File[]) => {
		const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
		if (list.length === 0) {
			toast.error("Only image attachments are supported for now");
			return;
		}

		setUploading(true);
		try {
			for (const file of list) {
				const formData = new FormData();
				formData.append("file", file);
				const previewUrl = URL.createObjectURL(file);

				const response = await fetch("/api/upload/v1/upload", {
					method: "POST",
					body: formData,
					credentials: "include",
				});
				if (!response.ok) {
					URL.revokeObjectURL(previewUrl);
					throw new Error(`Upload failed for ${file.name}`);
				}
				const data = (await response.json()) as { url?: string };
				if (!data.url) {
					URL.revokeObjectURL(previewUrl);
					throw new Error("Upload response missing url");
				}

				setAttachments((prev) => [
					...prev,
					{
						id: uid(),
						url: data.url as string,
						mime: file.type,
						name: file.name,
						previewUrl,
					},
				]);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}, []);

	return { attachments, uploading, addFiles, remove, clear, setAttachments };
}
