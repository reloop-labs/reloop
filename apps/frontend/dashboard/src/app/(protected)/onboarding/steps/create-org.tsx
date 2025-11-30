"use client";

import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "error";

export const CreateOrgStep = () => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [name, setName] = useQueryState("name", parseAsString.withDefault(""));
	const [slug, setSlug] = useQueryState("slug", parseAsString.withDefault(""));
	const [logoPreview, setLogoPreview] = useState("");
	const [logoUrl, setLogoUrl] = useQueryState(
		"logoUrl",
		parseAsString.withDefault(""),
	);
	const [isUploading, setIsUploading] = useState(false);
	const [referral, setReferral] = useQueryState(
		"referral",
		parseAsString.withDefault(""),
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [slugStatus, setSlugStatus] = useState<SlugStatus>("checking");

	useEffect(() => {
		if (!slug || slug.length < 2) {
			setSlugStatus("idle");
			return;
		}

		setSlugStatus("checking");
		const timeoutId = setTimeout(async () => {
			try {
				const { data } = await authClient.organization.checkSlug({ slug });
				setSlugStatus(data?.status ? "available" : "taken");
			} catch {
				setSlugStatus("error");
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [slug]);

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

			const response = await fetch("/api/upload/v1/upload", {
				method: "POST",
				body: formData,
				credentials: "include", // Include cookies for authentication
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				// If user doesn't have an organization yet, that's okay - we'll use base64
				if (response.status === 401 || response.status === 403) {
					console.log(
						"No organization yet, will upload after organization creation",
					);
					setIsUploading(false);
					return;
				}
				throw new Error(
					errorData.message || "Failed to upload file. Please try again.",
				);
			}

			const uploadData = await response.json();
			setLogoUrl(uploadData.url);
			toast.success("Logo uploaded successfully");
		} catch (error) {
			console.error("Upload error:", error);
			// Don't show error if it's just because user has no org yet
			// The base64 preview will be used as fallback
			if (
				error instanceof Error &&
				!error.message.includes("No organization yet")
			) {
				toast.error(
					error.message || "Failed to upload logo. You can still continue.",
				);
			}
		} finally {
			setIsUploading(false);
		}
	};

	const handleFileUploadClick = () => {
		fileInputRef.current?.click();
	};

	const onNext = async () => {
		const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");
		setSlug(normalizedSlug);

		// Use uploaded URL if available, otherwise use base64 preview
		const logoToUse = logoUrl || logoPreview || undefined;

		// If we have base64 but no URL, try to upload after org creation
		const hasBase64ButNoUrl = logoPreview && !logoUrl;

		const { error, data: organization } = await authClient.organization.create({
			name: name,
			keepCurrentActiveOrganization: true,
			slug: normalizedSlug,
			logo: logoToUse,
			metadata: { referral },
		});
		if (error) {
			toast.error(error.message || "Failed to create organization");
			return;
		}
		if (organization) {
			await authClient.updateUser({ activeOrganizationId: organization.id });

			// Small delay to ensure session is updated on backend before next step
			// Better Auth updates the session automatically, but backend services
			// might need a moment to see the updated session
			await new Promise((resolve) => setTimeout(resolve, 500));

			// If we had base64 but no URL, now upload it since we have an org
			if (hasBase64ButNoUrl && logoPreview) {
				try {
					// Convert base64 to blob
					const response = await fetch(logoPreview);
					const blob = await response.blob();
					const file = new File([blob], "logo.png", { type: blob.type });

					const formData = new FormData();
					formData.append("file", file);

					const uploadResponse = await fetch("/api/upload/v1/upload", {
						method: "POST",
						body: formData,
						credentials: "include",
					});

					if (uploadResponse.ok) {
						const uploadData = await uploadResponse.json();
						// Update organization with the uploaded logo URL
						// Note: You might want to add an update endpoint for this
						console.log("Logo uploaded after org creation:", uploadData.url);
					}
				} catch (uploadError) {
					console.error(
						"Failed to upload logo after org creation:",
						uploadError,
					);
					// Don't block the flow if this fails
				}
			}
		}

		setStep(step + 1);
	};

	return (
		<div className="fade-in animate-in duration-500">
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
							<Spinner size={20} />
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
						<Label.Root htmlFor="email">Workspace logo</Label.Root>
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
									<Spinner size={14} />
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
			<div className="space-y-3.5 pt-6">
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="company-name">Company name</Label.Root>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								id="company-name"
								type="text"
								value={name}
								className="font-medium"
								onChange={(e) => {
									const newName = e.target.value;
									setName(newName);
									setSlug(newName.toLowerCase().replace(/\s+/g, "-"));
								}}
								placeholder="e.g. Acme Corp"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="workspace-handle">Workspace handle</Label.Root>
					<Input.Root
						size="small"
						hasError={slugStatus === "taken"}
						hasSuccess={slugStatus === "available"}
					>
						<Input.Wrapper className="gap-0">
							<Input.InlineAffix className="m">
								reloop.sh/dashboard/
							</Input.InlineAffix>
							<Input.Input
								id="workspace-handle"
								type="text"
								className="font-medium"
								value={slug}
								onChange={(e) =>
									setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
								}
							/>
							<Spinner size={16} />
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
						<p className="text-paragraph-xs text-red-500">
							This workspace handle is already taken
						</p>
					)}
				</div>
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor="referral">How did you hear about us?</Label.Root>
					<Select.Root
						size="small"
						value={referral}
						onValueChange={setReferral}
					>
						<Select.Trigger className="font-medium text-sm">
							<Select.Value placeholder="Select an option" />
						</Select.Trigger>
						<Select.Content className="w-[524px]">
							<Select.Item value="social-media" className="h-9 text-sm">
								Social media
							</Select.Item>
							<Select.Item value="friend-colleague" className="h-9 p-2 text-sm">
								Friend/Colleague
							</Select.Item>
							<Select.Item value="search-engine" className="h-9 p-2 text-sm">
								Search engine
							</Select.Item>
							<Select.Item value="advertisement" className="h-9 p-2 text-sm">
								Advertisement
							</Select.Item>
							<Select.Item value="other" className="h-9 p-2 text-sm">
								Other
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<Button.Root
				variant="neutral"
				className="mt-6 w-full"
				mode="filled"
				onClick={onNext}
				disabled={slugStatus === "taken" || slugStatus === "checking" || !slug}
			>
				Create workspace
			</Button.Root>
		</div>
	);
};
