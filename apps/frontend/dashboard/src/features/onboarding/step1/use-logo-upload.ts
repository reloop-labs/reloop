import axios from "axios";
import { parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function useLogoUpload() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [logoPreview, setLogoPreview] = useQueryState(
		"logoPreview",
		parseAsString.withDefault(""),
	);
	const [logoUrl, setLogoUrl] = useQueryState(
		"logoUrl",
		parseAsString.withDefault(""),
	);

	const openFilePicker = () => {
		fileInputRef.current?.click();
	};

	const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		setLogoPreview(previewUrl);

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const { data: uploadData } = await axios.post(
				"/api/upload/v1/upload",
				formData,
				{ withCredentials: true },
			);

			setLogoUrl(uploadData.url);
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
