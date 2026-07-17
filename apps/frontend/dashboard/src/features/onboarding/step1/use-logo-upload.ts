import axios from "axios";
import { parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";

/**
 * Local object-URL / data-URL preview is kept in React state only.
 * Storing `blob:https://local.reloop.sh/...` in the query string is wrong:
 * it ties the preview to the app origin, dies on refresh, and after upload
 * was overridden by a remote URL that often could not load (mixed content).
 *
 * `logoUrl` (query state) holds the permanent upload service URL for create-org.
 */
export function useLogoUpload() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [logoPreview, setLogoPreview] = useState("");
	const [logoUrl, setLogoUrl] = useQueryState(
		"logoUrl",
		parseAsString.withDefault(""),
	);

	const openFilePicker = () => {
		fileInputRef.current?.click();
	};

	const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		// Allow re-selecting the same file after a failed upload.
		e.target.value = "";
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Data URL always loads in <img>; no mixed-content / blob-session issues.
		const reader = new FileReader();
		reader.onloadend = () => {
			setLogoPreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const { data: uploadData } = await axios.post(
				"/api/upload/v1/upload",
				formData,
				{ withCredentials: true },
			);

			const uploadedUrl = ensureAbsoluteUrl(uploadData.url as string);
			// Permanent absolute URL for org.create + sidebar/domain previews.
			// Keep the data-URL in logoPreview so the upload control always shows
			// the image even if the remote URL is slow or briefly unreachable.
			setLogoUrl(uploadedUrl);
			toast.success("Logo uploaded successfully");
		} catch (error) {
			console.error("Upload error:", error);
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401 || error.response?.status === 403) {
					return;
				}
				const errorMessage =
					error.response?.data?.message ||
					"Failed to upload file. Please try again.";
				toast.error(
					errorMessage || "Failed to upload logo. You can still continue.",
				);
			} else if (error instanceof Error) {
				if (!error.message.includes("No organization yet")) {
					toast.error(
						error.message || "Failed to upload logo. You can still continue.",
					);
				}
			}
		} finally {
			setIsUploading(false);
		}
	};

	return {
		fileInputRef,
		isUploading,
		logoPreview,
		logoUrl,
		openFilePicker,
		onFileChange,
	};
}
