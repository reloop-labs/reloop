import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FileUpload from "@reloop/ui/file-upload";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import type { RefObject } from "react";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";

export function LogoUpload({
	fileInputRef,
	isUploading,
	logoPreview,
	logoUrl,
	onFileChange,
	onUploadClick,
}: {
	fileInputRef: RefObject<HTMLInputElement | null>;
	isUploading: boolean;
	logoPreview: string;
	logoUrl: string;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onUploadClick: () => void;
}) {
	// Prefer local data-URL preview first so the image always shows while the
	// remote upload URL settles (and if remote is temporarily unreachable).
	const displaySrc = ensureAbsoluteUrl(logoPreview || logoUrl);
	const hasLogo = Boolean(displaySrc);

	return (
		<div className="flex items-center gap-4">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={onFileChange}
				className="hidden"
			/>
			<FileUpload.Root
				className={cn(
					"flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl",
					hasLogo ? "border-none p-0" : "border border-stroke-sub-300 p-1",
					isUploading && "cursor-wait opacity-50",
					!isUploading && "cursor-pointer",
				)}
				data-has-logo={hasLogo}
				onClick={isUploading ? undefined : onUploadClick}
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
				<Label.Root htmlFor="company-name">Organization logo</Label.Root>
				<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
					Recommended size 1:1, up to 10MB.
				</p>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xxsmall"
					type="button"
					onClick={onUploadClick}
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
