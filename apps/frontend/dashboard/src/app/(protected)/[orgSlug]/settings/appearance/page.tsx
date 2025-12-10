"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ThemeToggleAppearance } from "./theme-toggle";

const AppearancePage = () => {
	const { data: session, refetch } = authClient.useSession();
	const user = session?.user;

	const [userName, setUserName] = useState(user?.name || "");
	const [imagePreview, setImagePreview] = useState(user?.image || "");
	const [imageUrl, setImageUrl] = useState(user?.image || "");
	const [isUploading, setIsUploading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync state when session loads
	useEffect(() => {
		if (user) {
			setUserName(user.name || "");
			setImagePreview(user.image || "");
			setImageUrl(user.image || "");
		}
	}, [user?.name, user?.image]);

	// Check if there are any changes
	const hasChanges =
		userName !== (user?.name || "") || imageUrl !== (user?.image || "");

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

	const handleSaveChanges = async () => {
		if (!hasChanges) return;

		setIsSaving(true);
		try {
			const { error } = await authClient.updateUser({
				name: userName,
				image: imageUrl || undefined,
			});

			if (error) {
				toast.error(error.message || "Failed to update profile");
				return;
			}

			// Refresh session data
			await refetch();
			toast.success("Profile updated successfully");
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="w-full space-y-8 pt-5">
			{/* Profile Section */}
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Profile
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Customize your personal profile
					</p>
				</div>
				<div className="w-full space-y-5">
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
										: "border border-stroke-sub-300 p-1",
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
										alt="Profile picture preview"
										className="h-full w-full rounded-full object-cover"
									/>
								) : (
									<FileUpload.Icon
										name="user"
										as={Icon}
										className="h-6 w-6"
									/>
								)}
							</FileUpload.Root>
							<div>
								<Label.Root htmlFor="profileImage">Profile picture</Label.Root>
								<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
									Recommended size 1:1, up to 10MB.
								</p>
								<Button.Root
									variant="neutral"
									mode="stroke"
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
											Upload Photo
										</>
									)}
								</Button.Root>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-3">
						<div>
							<Label.Root htmlFor="userName">Name</Label.Root>
							<Input.Root className="mt-1 w-full">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="userName"
										type="text"
										placeholder="Your Name"
										value={userName}
										onChange={(e) => setUserName(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>
					<div className="flex justify-end">
						<Button.Root
							variant="neutral"
							size="xxsmall"
							onClick={handleSaveChanges}
							disabled={!hasChanges || isUploading || isSaving}
						>
							{isSaving ? (
								<>
									<Spinner size={14} color="var(--text-strong-950)" />
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</Button.Root>
					</div>
				</div>
			</div>

			{/* Theme Section */}
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Theme
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Select a theme to personalize your platform’s appearance
					</p>
				</div>
				<ThemeToggleAppearance />
			</div>
		</div>
	);
};

export default AppearancePage;
