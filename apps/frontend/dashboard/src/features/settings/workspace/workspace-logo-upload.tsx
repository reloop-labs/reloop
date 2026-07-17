import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";

interface WorkspaceLogoUploadProps {
	organizationId: string;
	initialLogoUrl?: string;
	onLogoChange: (url: string) => void;
}

export function WorkspaceLogoUpload({
	organizationId,
	initialLogoUrl,
	onLogoChange,
}: WorkspaceLogoUploadProps) {
	const queryClient = useQueryClient();
	const [logoPreview, setLogoPreview] = useState(
		ensureAbsoluteUrl(initialLogoUrl),
	);
	const [logoUrl, setLogoUrl] = useState(ensureAbsoluteUrl(initialLogoUrl));
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const next = ensureAbsoluteUrl(initialLogoUrl);
		setLogoUrl(next);
		// Don't replace a local FileReader data-URL with a remote URL
		// (onboarding keeps the data-URL in logoPreview for display).
		if (!isUploading) {
			setLogoPreview((prev) => (prev.startsWith("data:") ? prev : next));
		}
	}, [initialLogoUrl, isUploading]);

	const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
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
			// Keep data-URL in logoPreview (same as onboarding) so the control
			// always shows the image even if the remote URL is unreachable.
			setLogoUrl(uploadedUrl);
			onLogoChange(uploadedUrl);

			const { error } = await authClient.organization.update({
				organizationId,
				data: {
					logo: uploadedUrl,
				},
			});

			if (error) {
				toast.error(error.message || "Failed to save logo");
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.organizations(),
			});
			toast.success("Logo updated successfully");
		} catch (error) {
			console.error("Upload error:", error);
			setLogoPreview(logoUrl || ensureAbsoluteUrl(initialLogoUrl));
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401 || error.response?.status === 403) {
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

	// Prefer local data-URL preview first (same as onboarding LogoUpload).
	const displaySrc = ensureAbsoluteUrl(logoPreview || logoUrl);
	const hasLogo = Boolean(displaySrc);

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
					hasLogo
						? "border border-stroke-soft-200 border-solid p-0"
						: "border border-stroke-soft-200 p-1",
					isUploading && "cursor-wait opacity-50",
					!isUploading && "cursor-pointer",
				)}
				data-has-logo={hasLogo}
				onClick={isUploading ? undefined : handleFileUploadClick}
			>
				{isUploading ? (
					<Spinner size={20} color="var(--text-strong-950)" />
				) : hasLogo ? (
					<img
						src={displaySrc}
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
}
