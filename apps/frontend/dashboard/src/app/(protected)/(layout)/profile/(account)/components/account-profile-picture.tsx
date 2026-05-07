"use client";

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

interface AccountProfilePictureProps {
	initialImageUrl?: string;
	onImageChange: (url: string) => void;
	initials: string;
}

export const AccountProfilePicture = ({
	initialImageUrl,
	onImageChange,
	initials,
}: AccountProfilePictureProps) => {
	const { refetch } = authClient.useSession();
	const [imagePreview, setImagePreview] = useState(initialImageUrl || "");
	const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
			setImagePreview(reader.result as string);
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
			setImageUrl(uploadedUrl);
			onImageChange(uploadedUrl);

			// Immediately save to database
			const { error } = await authClient.updateUser({
				image: uploadedUrl,
			});

			if (error) {
				toast.error(error.message || "Failed to save profile picture");
				return;
			}

			// Refresh session data
			await refetch();
			toast.success("Profile picture updated successfully");
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
				toast.error(error.message || "Failed to upload profile picture.");
			}
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileUploadClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div>
			<div className="flex items-center gap-4">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleImageChange}
					className="hidden"
				/>
				<FileUpload.Root
					className={cn(
						"flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full",
						imageUrl || imagePreview
							? "border border-stroke-sub-300 border-solid p-0"
							: "border border-stroke-sub-300 bg-primary p-1",
						isUploading && "cursor-wait opacity-50",
						!isUploading && "cursor-pointer",
					)}
					data-has-image={!!(imageUrl || imagePreview)}
					onClick={isUploading ? undefined : handleFileUploadClick}
				>
					{isUploading ? (
						<Spinner size={20} color="var(--text-strong-950)" />
					) : imageUrl || imagePreview ? (
						<img
							src={imageUrl || imagePreview}
							alt="Profile preview"
							className="h-full w-full rounded-full object-cover"
						/>
					) : (
						<span className="font-medium text-white text-xl">{initials}</span>
					)}
				</FileUpload.Root>
				<div>
					<Label.Root htmlFor="profileImage">Profile Picture</Label.Root>
					<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
						We only support PNGs, JPEGs and GIFs under 10MB
					</p>
					<Button.Root
						variant="neutral"
						mode="filled"
						size="xxsmall"
						type="button"
						onClick={handleFileUploadClick}
						disabled={isUploading}
					>
						{isUploading ? (
							<>
								<Spinner size={14} color="var(--bg-white-0)" />
								Uploading...
							</>
						) : (
							<>
								<Icon name="camera" className="h-4 w-4" />
								Upload image
							</>
						)}
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
