"use client";

import { Loader2, RefreshCw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ensureAbsoluteUrl } from "../absolute-url";
import { ScrubField } from "./scrub-field";
import { TextInput } from "./text-input";
import { AlignControls } from "./typography/align-controls";
import { UrlInput } from "./url-input";

export interface ImageSrcValue {
	src: string;
	alt: string;
	href?: string;
	width: number | "";
	height: number | "";
	align?: string;
}

export function ImageSrcControl({
	value,
	onChange,
}: {
	value: ImageSrcValue;
	onChange: (v: ImageSrcValue) => void;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		if (file.size > 15 * 1024 * 1024) {
			toast.error("File size must be under 15MB");
			return;
		}

		setIsUploading(true);
		const reader = new FileReader();
		reader.onload = (event) => {
			const dataUrl = event.target?.result as string;
			if (dataUrl) {
				const uploadedUrl = ensureAbsoluteUrl(dataUrl);
				onChange({ ...value, src: uploadedUrl });
				toast.success("Image uploaded successfully");
			}
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		};
		reader.onerror = () => {
			toast.error("Failed to read image file");
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		};
		reader.readAsDataURL(file);
	};

	return (
		<div className="flex w-full flex-col gap-2.5">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFileSelect}
			/>

			{/* Preview */}
			{value.src && (
				<div className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-soft-200/20 p-2 dark:border-stroke-soft-100/40">
					<img
						src={value.src}
						alt={value.alt || "preview"}
						className="max-h-28 w-auto max-w-full rounded-lg object-contain"
					/>
					<button
						type="button"
						title="Replace image from computer"
						aria-label="Replace image from computer"
						disabled={isUploading}
						onClick={() => fileInputRef.current?.click()}
						className="absolute top-2 right-2 flex h-7 items-center gap-1.5 rounded-lg bg-black/75 px-2 font-medium text-[11px] text-white shadow-md backdrop-blur-sm transition-all hover:bg-black active:scale-95 disabled:opacity-50"
					>
						{isUploading ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
						) : (
							<RefreshCw className="h-3.5 w-3.5" />
						)}
						<span>Replace</span>
					</button>
				</div>
			)}

			{/* Source URL */}
			<div className="flex flex-col gap-1">
				<div className="flex items-center justify-between">
					<span className="font-medium text-[11px] text-text-sub-600">
						Image Source
					</span>
					<button
						type="button"
						disabled={isUploading}
						onClick={() => fileInputRef.current?.click()}
						className="flex items-center gap-1 font-medium text-[11px] text-blue-500 transition-colors hover:text-blue-600 disabled:opacity-50"
					>
						{isUploading ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<Upload className="h-3 w-3" />
						)}
						<span>Upload</span>
					</button>
				</div>
				<UrlInput
					value={value.src}
					onChange={(src) => onChange({ ...value, src })}
					placeholder="https://example.com/image.png"
				/>
			</div>

			{/* Destination Link */}
			<div className="flex flex-col gap-1">
				<span className="font-medium text-[11px] text-text-sub-600">
					Link Destination (Optional)
				</span>
				<UrlInput
					value={value.href || ""}
					onChange={(href) => onChange({ ...value, href })}
					placeholder="https://example.com/destination"
				/>
			</div>

			{/* Alt Text */}
			<div className="flex flex-col gap-1">
				<span className="font-medium text-[11px] text-text-sub-600">
					Alternative Text
				</span>
				<TextInput
					value={value.alt}
					onChange={(alt) => onChange({ ...value, alt })}
					placeholder="Description for accessibility & Outlook…"
				/>
			</div>

			{/* Dimensions */}
			<div className="flex flex-col gap-1">
				<span className="font-medium text-[11px] text-text-sub-600">
					Dimensions
				</span>
				<div className="grid grid-cols-2 gap-2">
					<ScrubField
						label="Width"
						prefix="W"
						placeholder="auto"
						value={value.width}
						onChange={(width) => onChange({ ...value, width })}
						suffix="px"
						min={1}
						max={2000}
					/>
					<ScrubField
						label="Height"
						prefix="H"
						placeholder="auto"
						value={value.height}
						onChange={(height) => onChange({ ...value, height })}
						suffix="px"
						min={1}
						max={2000}
					/>
				</div>
			</div>

			{/* Alignment */}
			{value.align !== undefined && (
				<div className="flex flex-col gap-1">
					<span className="font-medium text-[11px] text-text-sub-600">
						Alignment
					</span>
					<AlignControls
						alignment={value.align || "center"}
						setAlignment={(align) => onChange({ ...value, align })}
					/>
				</div>
			)}
		</div>
	);
}
