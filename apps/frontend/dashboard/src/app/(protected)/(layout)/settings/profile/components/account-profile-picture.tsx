"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AccountProfilePictureProps {
	initialImageUrl?: string;
	onImageChange: (url: string) => void;
	/** Display name used for initials fallback. */
	name?: string | null;
	initials: string;
	email: string;
}

export const AccountProfilePicture = ({
	initialImageUrl,
	onImageChange,
	name,
	initials,
	email,
}: AccountProfilePictureProps) => {
	const { refetch } = authClient.useSession();
	const [imagePreview, setImagePreview] = useState(initialImageUrl || "");
	const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
	const [imageFailed, setImageFailed] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Keep local state in sync when session user.image arrives/changes after mount.
	useEffect(() => {
		const next = initialImageUrl || "";
		setImageUrl(next);
		// Don't clobber a local FileReader preview with an empty remote value mid-upload.
		if (!isUploading) {
			setImagePreview(next);
		}
		setImageFailed(false);
	}, [initialImageUrl, isUploading]);

	const displaySrc = (imagePreview || imageUrl).trim();
	const showPhoto = Boolean(displaySrc) && !imageFailed;
	const fallbackInitial =
		initials?.trim() || getAvatarInitial(name ?? null, email);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

		// Show preview immediately
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
			setImageFailed(false);
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

			const uploadedUrl = uploadData.url as string;
			setImageUrl(uploadedUrl);
			setImagePreview(uploadedUrl);
			setImageFailed(false);
			onImageChange(uploadedUrl);

			const { error } = await authClient.updateUser({
				image: uploadedUrl,
			});

			if (error) {
				toast.error(error.message || "Failed to save profile picture");
				return;
			}

			await refetch();
			toast.success("Profile picture updated successfully");
		} catch (error) {
			console.error("Upload error:", error);
			// Roll back to the last known good remote URL.
			setImagePreview(imageUrl || initialImageUrl || "");
			setImageFailed(false);
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401 || error.response?.status === 403) {
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
				<button
					type="button"
					className={cn(
						"relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full",
						showPhoto
							? "border border-stroke-sub-300 border-solid bg-background"
							: cn("border-none", getAvatarGradient(email || "user")),
						isUploading && "cursor-wait opacity-50",
						!isUploading && "cursor-pointer",
					)}
					onClick={isUploading ? undefined : handleFileUploadClick}
					disabled={isUploading}
					aria-label="Upload profile picture"
				>
					{/* Initials always present under the photo so a failed load never blanks out. */}
					<span
						aria-hidden={showPhoto || isUploading}
						className={cn(
							"absolute inset-0 flex items-center justify-center font-semibold text-2xl text-white uppercase tracking-wide",
							(showPhoto || isUploading) && "invisible",
						)}
					>
						{fallbackInitial}
					</span>

					{isUploading ? (
						<span className="relative z-[1]">
							<Spinner size={20} color="var(--text-strong-950)" />
						</span>
					) : showPhoto ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={displaySrc}
							alt="Profile"
							className="relative z-[1] h-full w-full rounded-full object-cover"
							onError={() => setImageFailed(true)}
							referrerPolicy="no-referrer"
						/>
					) : null}
				</button>
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
