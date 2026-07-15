"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

interface WorkspaceLogoUploadProps {
	initialLogoUrl?: string;
	onLogoChange: (url: string) => void;
}

export const WorkspaceLogoUpload = ({
	initialLogoUrl,
	onLogoChange,
}: WorkspaceLogoUploadProps) => {
	const { activeOrganization, mutateOrganizations } = useUserOrganization();
	const [logoPreview, setLogoPreview] = useState(initialLogoUrl || "");
	const [logoUrl, setLogoUrl] = useState(initialLogoUrl || "");
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Show preview immediately
		const reader = new FileReader();
		reader.onloadend = () => {
			setLogoPreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		// Upload to upload service
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const { data: uploadData } = await axios.post(
				"/api/upload/v1/upload",
				formData,
				{ withCredentials: true },
			);

			const uploadedUrl = uploadData.url;
			setLogoUrl(uploadedUrl);
			onLogoChange(uploadedUrl);

			// Immediately save to database
			const { error } = await authClient.organization.update({
				organizationId: activeOrganization?.id ?? "",
				data: {
					logo: uploadedUrl,
				},
			});

			if (error) {
				toast.error(error.message || "Failed to save logo");
				return;
			}

			// Refresh organization data
			await mutate(
				(key) => Array.isArray(key) && key[0] === "organizations",
			);
			mutateOrganizations();
			toast.success("Logo updated successfully");
		} catch (error) {
			console.error("Upload error:", error);
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401 || error.response?.status === 403) {
					setIsUploading(false);
					return;
				}
				const errorMessage =
					error.response?.data?.message ||
					"Failed to upload file. Please try again.";
				toast.error(errorMessage);
			} else if (error instanceof Error) {
				toast.error(error.message || "Failed to upload logo.");
			}
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileUploadClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="flex items-center gap-4">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleLogoChange}
				className="hidden"
			/>
			<FileUpload.Root
				className={cn(
					"flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl",
					logoUrl || logoPreview
						? "border border-stroke-sub-300 border-solid p-0"
						: "border border-stroke-sub-300 p-1",
					isUploading && "cursor-wait opacity-50",
					!isUploading && "cursor-pointer",
				)}
				data-has-logo={!!(logoUrl || logoPreview)}
				onClick={isUploading ? undefined : handleFileUploadClick}
			>
				{isUploading ? (
					<Spinner size={20} color="var(--text-strong-950)" />
				) : logoUrl || logoPreview ? (
					<img
						src={logoUrl || logoPreview}
						alt="Logo preview"
						className="h-full w-full rounded-xl object-cover"
					/>
				) : (
					<FileUpload.Icon name="image-upload" as={Icon} className="h-4 w-4" />
				)}
			</FileUpload.Root>
			<div>
				<Label.Root htmlFor="logo">Workspace logo</Label.Root>
				<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
					Recommended size 1:1, up to 10MB.
				</p>
				<Button.Root
					variant="neutral"
					size="xxsmall"
					type="button"
					onClick={handleFileUploadClick}
					disabled={isUploading}
				>
					{isUploading ? (
						<>
							<Spinner size={14} color="var(--text-strong-950)" />
							Uploading...
						</>
					) : (
						<>
							<Icon name="camera" className="h-4 w-4" />
							Upload Logo
						</>
					)}
				</Button.Root>
			</div>
		</div>
	);
};
