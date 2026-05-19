import { ColorPicker } from "./color-picker";
import { TextInput } from "./text-input";
import { UrlInput } from "./url-input";

export interface BackgroundValue {
	color: string;
	imageUrl: string;
	size: string;
	repeat: string;
	position: string;
}

const BG_SIZES = ["auto", "cover", "contain"];
const BG_REPEATS = ["no-repeat", "repeat", "repeat-x", "repeat-y"];
const BG_POSITIONS = [
	"center",
	"top",
	"bottom",
	"left",
	"right",
	"top left",
	"top right",
	"bottom left",
	"bottom right",
];

import * as Button from "@reloop/ui/button";

export function BackgroundControl({
	value,
	onChange,
}: {
	value: BackgroundValue;
	onChange: (v: BackgroundValue) => void;
}) {
	return (
		<div className="flex w-full flex-col gap-1.5">
			<ColorPicker
				value={value.color}
				onChange={(c) => onChange({ ...value, color: c })}
			/>
			<UrlInput
				value={value.imageUrl}
				onChange={(u) => onChange({ ...value, imageUrl: u })}
				placeholder="Image URL…"
			/>
			{value.imageUrl && (
				<>
					<div className="grid grid-cols-3 gap-1">
						{BG_SIZES.map((s) => {
							const isActive = value.size === s;
							return (
								<Button.Root
									key={s}
									type="button"
									variant="neutral"
									mode={isActive ? "lighter" : "ghost"}
									size="xxsmall"
									onClick={() => onChange({ ...value, size: s })}
									className={`rounded border px-1 py-0.5 text-[10px] outline-none ring-0 transition-colors ${
										isActive
											? "border-(--re-text) bg-(--re-text) text-(--re-bg)"
											: "border-(--re-border) bg-transparent text-(--re-text-muted)"
									}`}
								>
									{s}
								</Button.Root>
							);
						})}
					</div>
					<div className="grid grid-cols-4 gap-1">
						{BG_REPEATS.map((r) => {
							const isActive = value.repeat === r;
							return (
								<Button.Root
									key={r}
									type="button"
									variant="neutral"
									mode={isActive ? "lighter" : "ghost"}
									size="xxsmall"
									onClick={() => onChange({ ...value, repeat: r })}
									className={`rounded border px-1 py-0.5 text-[10px] outline-none ring-0 transition-colors ${
										isActive
											? "border-(--re-text) bg-(--re-text) text-(--re-bg)"
											: "border-(--re-border) bg-transparent text-(--re-text-muted)"
									}`}
								>
									{r.replace("repeat-", "")}
								</Button.Root>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
}
