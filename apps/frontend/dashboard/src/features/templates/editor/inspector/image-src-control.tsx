"use client";

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
	return (
		<div className="flex w-full flex-col gap-2.5">
			{/* Preview */}
			{value.src && (
				<div className="flex w-full items-center justify-center overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-soft-200/20 p-2 dark:border-stroke-soft-100/40">
					<img
						src={value.src}
						alt={value.alt || "preview"}
						className="max-h-28 w-auto max-w-full rounded-lg object-contain"
					/>
				</div>
			)}

			{/* Source URL */}
			<div className="flex flex-col gap-1">
				<span className="font-medium text-[11px] text-text-sub-600">Image Source</span>
				<UrlInput
					value={value.src}
					onChange={(src) => onChange({ ...value, src })}
					placeholder="https://example.com/image.png"
				/>
			</div>

			{/* Destination Link */}
			<div className="flex flex-col gap-1">
				<span className="font-medium text-[11px] text-text-sub-600">Link Destination (Optional)</span>
				<UrlInput
					value={value.href || ""}
					onChange={(href) => onChange({ ...value, href })}
					placeholder="https://example.com/destination"
				/>
			</div>

			{/* Alt Text */}
			<div className="flex flex-col gap-1">
				<span className="font-medium text-[11px] text-text-sub-600">Alternative Text</span>
				<TextInput
					value={value.alt}
					onChange={(alt) => onChange({ ...value, alt })}
					placeholder="Description for accessibility & Outlook…"
				/>
			</div>

			{/* Dimensions */}
			<div className="flex flex-col gap-1">
				<span className="font-medium text-[11px] text-text-sub-600">Dimensions</span>
				<div className="grid grid-cols-2 gap-2">
					<ScrubField
						label="Width"
						prefix="W"
						value={value.width}
						onChange={(width) => onChange({ ...value, width })}
						suffix="px"
						min={1}
						max={2000}
					/>
					<ScrubField
						label="Height"
						prefix="H"
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
					<span className="font-medium text-[11px] text-text-sub-600">Alignment</span>
					<AlignControls
						alignment={value.align || "center"}
						setAlignment={(align) => onChange({ ...value, align })}
					/>
				</div>
			)}
		</div>
	);
}
