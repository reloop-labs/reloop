"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
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
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

const SettingsPage = () => {
	const { activeOrganization, mutateOrganizations } = useUserOrganization();
	const [organizationName, setOrganizationName] = useState(
		activeOrganization.name,
	);
	const [slug, setSlug] = useState(activeOrganization.slug);
	const [logoPreview, setLogoPreview] = useState(activeOrganization.logo || "");
	const [logoUrl, setLogoUrl] = useState(activeOrganization.logo || "");
	const [isUploading, setIsUploading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const slugCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Check if there are any changes
	const hasChanges =
		organizationName !== activeOrganization.name ||
		slug !== activeOrganization.slug ||
		logoUrl !== (activeOrganization.logo || "");

	// Handle slug change with debounced validation
	const handleSlugChange = async (newSlug: string) => {
		const normalizedSlug = newSlug.toLowerCase().replace(/\s+/g, "-");
		setSlug(normalizedSlug);

		// Clear any pending timeout
		if (slugCheckTimeoutRef.current) {
			clearTimeout(slugCheckTimeoutRef.current);
		}

		if (!normalizedSlug || normalizedSlug.length < 2) {
			setSlugStatus("idle");
			return;
		}

		// If slug is the same as current organization slug, it's available
		if (normalizedSlug === activeOrganization.slug) {
			setSlugStatus("available");
			return;
		}

		setSlugStatus("checking");
		slugCheckTimeoutRef.current = setTimeout(async () => {
			try {
				const { data } = await authClient.organization.checkSlug({ slug: normalizedSlug });
				setSlugStatus(data?.status ? "available" : "taken");
			} catch {
				setSlugStatus("error");
			}
		}, 500);
	};

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

			// Immediately save to database
			const { error } = await authClient.organization.update({
				organizationId: activeOrganization.id,
				data: {
					logo: uploadedUrl,
				},
			});

			if (error) {
				toast.error(error.message || "Failed to save logo");
				return;
			}

			// Refresh organization data
			await mutate("organizations");
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

	const handleSaveChanges = async () => {
		if (!hasChanges) return;

		// Validate slug
		if (slugStatus === "taken") {
			toast.error("Please choose a different slug");
			return;
		}

		if (slugStatus === "checking") {
			toast.error("Please wait for slug validation to complete");
			return;
		}

		setIsSaving(true);
		try {
			const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
			const { error } = await authClient.organization.update({
				organizationId: activeOrganization.id,
				data: {
					name: organizationName,
					slug: normalizedSlug,
					logo: logoUrl || undefined,
				},
			});

			if (error) {
				toast.error(error.message || "Failed to update workspace");
				return;
			}

			// Refresh organization data - use global mutate to update all SWR consumers
			await mutate("organizations");
			mutateOrganizations();
			toast.success("Workspace updated successfully");

			// If slug changed, redirect to new URL
			if (normalizedSlug !== activeOrganization.slug) {
				window.location.href = `/dashboard/${normalizedSlug}/settings`;
			}
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Failed to update workspace");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						Workspace
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Customize your workspace settings
					</p>
				</div>
				<div className="w-full space-y-5">
					<div>
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
									<FileUpload.Icon
										name="image-upload"
										as={Icon}
										className="h-4 w-4"
									/>
								)}
							</FileUpload.Root>
							<div>
								<Label.Root htmlFor="logo">Workspace logo</Label.Root>
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
											Upload Logo
										</>
									)}
								</Button.Root>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-3">
						<div>
							<Label.Root htmlFor="name">Name</Label.Root>
							<Input.Root className="mt-1 w-full" size="small">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="name"
										type="text"
										placeholder="Organization Name"
										value={organizationName}
										onChange={(e) => {
											const newName = e.target.value;
											setOrganizationName(newName);
										}}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div>
							<Label.Root htmlFor="slug">Slug</Label.Root>
							<Input.Root
								size="small"
								className="mt-1 w-full"
								hasError={slugStatus === "taken"}
								hassuccess={slugStatus === "available"}
							>
								<Input.Wrapper className="gap-0">
									<Input.InlineAffix>reloop.sh/dashboard/</Input.InlineAffix>
									<Input.Input
										id="slug"
										type="text"
										placeholder="organization-slug"
										value={slug}
										onChange={(e) => handleSlugChange(e.target.value)}
									/>
									{slugStatus === "checking" && (
										<Input.InlineAffix>
											<Spinner size={16} color="var(--text-strong-950)" />
										</Input.InlineAffix>
									)}
									{slugStatus === "available" && (
										<Input.InlineAffix>
											<Icon
												name="check-circle"
												className="h-4 w-4 text-green-500"
											/>
										</Input.InlineAffix>
									)}
									{slugStatus === "taken" && (
										<Input.InlineAffix>
											<Icon name="x-circle" className="h-4 w-4 text-red-500" />
										</Input.InlineAffix>
									)}
								</Input.Wrapper>
							</Input.Root>
							{slugStatus === "taken" && (
								<p className="mt-1 text-paragraph-xs text-red-500">
									This workspace handle is already taken
								</p>
							)}
						</div>
					</div>
					<div className="flex justify-end">
						<Button.Root
							variant="neutral"
							size="xsmall"
							onClick={handleSaveChanges}
							disabled={
								!hasChanges ||
								slugStatus === "taken" ||
								slugStatus === "checking" ||
								isUploading ||
								isSaving
							}
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
					<p className="font-medium text-label-md text-text-strong-950">
						Danger zone
					</p>
					<div className="rounded-xl border border-error-light py-2 pr-2.5 pl-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-label-sm text-text-strong-950">
									Delete workspace
								</p>
								<p className="text-paragraph-xs text-text-sub-600">
									Delete your workspace and all of its data. This action is
									irreversible.
								</p>
							</div>
							<Button.Root variant="error" size="xsmall">
								<Icon name="trash" className="size-3 text-white" />
								Delete workspace
							</Button.Root>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
