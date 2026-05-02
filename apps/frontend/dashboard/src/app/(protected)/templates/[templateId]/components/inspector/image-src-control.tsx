import { UrlInput } from "./url-input";
import { TextInput } from "./text-input";
import { NumberField } from "./number-field";

export interface ImageSrcValue {
	src: string;
	alt: string;
	width: number | "";
	height: number | "";
}

export function ImageSrcControl({
	value,
	onChange,
}: {
	value: ImageSrcValue;
	onChange: (v: ImageSrcValue) => void;
}) {
	return (
		<div className="flex flex-col gap-1.5 w-full">
			{/* Preview */}
			{value.src && (
				<img
					src={value.src}
					alt={value.alt || "preview"}
					className="max-h-20 w-full rounded border border-(--re-border) object-contain"
				/>
			)}
			<UrlInput
				value={value.src}
				onChange={(src) => onChange({ ...value, src })}
				placeholder="Image URL…"
			/>
			<TextInput
				value={value.alt}
				onChange={(alt) => onChange({ ...value, alt })}
				placeholder="Alt text…"
			/>
			<div className="flex items-center gap-2">
				<span className="flex flex-col items-center gap-0.5">
					<NumberField
						value={value.width}
						onChange={(width) => onChange({ ...value, width })}
						unit="px"
					/>
					<span className="text-[10px] text-(--re-text-muted)">Width</span>
				</span>
				<span className="flex flex-col items-center gap-0.5">
					<NumberField
						value={value.height}
						onChange={(height) => onChange({ ...value, height })}
						unit="px"
					/>
					<span className="text-[10px] text-(--re-text-muted)">Height</span>
				</span>
			</div>
		</div>
	);
}
