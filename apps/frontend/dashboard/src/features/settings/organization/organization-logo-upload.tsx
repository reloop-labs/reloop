import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";

interface OrganizationLogoUploadProps {
	organizationId: string;
	initialLogoUrl?: string;
	onLogoChange: (url: string) => void;
}

export function OrganizationLogoUpload({
	organizationId,
	initialLogoUrl,
	onLogoChange,
}: OrganizationLogoUploadProps) {
	const queryClient = useQueryClient();
	const [logoPreview, setLogoPreview] = useState(
		ensureAbsoluteUrl(initialLogoUrl),
	);
	const [logoUrl, setLogoUrl] = useState(ensureAbsoluteUrl(initialLogoUrl));
	const [status, setStatus] = useState<"idle" | "uploading" | "success">(
		"idle",
	);
	const isUploading = status === "uploading";
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

		setStatus("uploading");
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
				setStatus("idle");
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.organizations(),
			});
			setStatus("success");
			setTimeout(() => {
				setStatus("idle");
			}, 1500);
		} catch (error) {
			console.error("Upload error:", error);
			setLogoPreview(logoUrl || ensureAbsoluteUrl(initialLogoUrl));
			setStatus("idle");
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
				<Label.Root htmlFor="logo">Organization logo</Label.Root>
				<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
					Recommended size 1:1, up to 10MB.
				</p>
				<FancyButton.Root
					variant={status === "success" ? "success" : "basic"}
					size="xsmall"
					type="button"
					onClick={handleFileUploadClick}
					disabled={status !== "idle"}
					className={cn(
						"min-w-[140px] justify-center overflow-hidden font-medium transition-all duration-200",
						status === "uploading" && "opacity-90",
					)}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={status}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{ opacity: 0, y: -14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							className="flex items-center justify-center gap-1.5 font-medium"
						>
							{status === "uploading" ? (
								<>
									<Spinner size={14} color="var(--text-strong-950)" />
									<span>Uploading...</span>
								</>
							) : status === "success" ? (
								<>
									<Icon name="check-circle" className="h-4 w-4" />
									<span>Uploaded</span>
								</>
							) : (
								<>
									<FancyButton.Icon as={Icon} name="camera" />
									<span>Upload Logo</span>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</div>
	);
}
