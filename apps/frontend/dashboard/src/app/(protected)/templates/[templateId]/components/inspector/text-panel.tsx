import { Inspector } from "@react-email/editor/ui";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Italic,
	Strikethrough,
	Type,
	Underline,
} from "lucide-react";
import { ColorRow } from "./color-row";
import { MarkButton } from "./mark-button";
import { NumInput } from "./num-input";
import { PropRow } from "./prop-row";
import { SectionHeader } from "./section-header";

/* ------------------------------------------------------------------ */
/* Text panel                                                           */
/* ------------------------------------------------------------------ */
const ALIGN_OPTIONS = [
	{ value: "left" as const, icon: AlignLeft, label: "Align left" },
	{ value: "center" as const, icon: AlignCenter, label: "Align center" },
	{ value: "right" as const, icon: AlignRight, label: "Align right" },
];

const MARK_OPTIONS = [
	{ mark: "bold", icon: Bold, label: "Bold" },
	{ mark: "italic", icon: Italic, label: "Italic" },
	{ mark: "underline", icon: Underline, label: "Underline" },
	{ mark: "strike", icon: Strikethrough, label: "Strikethrough" },
];

export function TextPanel() {
	return (
		<Inspector.Text>
			{({
				marks,
				toggleMark,
				alignment,
				setAlignment,
				linkColor,
				setLinkColor,
				isLinkActive,
				getStyle,
				setStyle,
			}) => (
				<div>
					<SectionHeader label="Text" icon={Type} />

					{/* Color */}
					<ColorRow
						label="Color"
						value={String(getStyle("color") ?? "")}
						onChange={(v) => setStyle("color", v)}
					/>

					{/* Font size */}
					<PropRow label="Font size">
						<NumInput
							value={getStyle("fontSize")}
							onChange={(v) => setStyle("fontSize", v as number)}
							unit="px"
						/>
					</PropRow>

					{/* Line height */}
					<PropRow label="Line height">
						<NumInput
							value={getStyle("lineHeight")}
							onChange={(v) => setStyle("lineHeight", v as number)}
							unit="%"
						/>
					</PropRow>

					{/* Letter spacing */}
					<PropRow label="Tracking">
						<NumInput
							value={getStyle("letterSpacing")}
							onChange={(v) => setStyle("letterSpacing", v as number)}
							unit="px"
						/>
					</PropRow>

					{/* Format marks + alignment */}
					<div className="flex items-center gap-2 px-4 pb-3 pt-1">
						{/* Mark buttons */}
						<div className="flex items-center gap-1">
							{MARK_OPTIONS.map(({ mark, icon, label }) => (
								<MarkButton
									key={mark}
									icon={icon}
									label={label}
									active={marks[mark] ?? false}
									onClick={() => toggleMark(mark)}
								/>
							))}
						</div>

						{/* Divider */}
						<div className="h-6 w-px bg-stroke-soft-200" />

						{/* Alignment buttons */}
						<div className="flex flex-1 items-center gap-1">
							{ALIGN_OPTIONS.map(({ value: a, icon: Icon, label }) => (
								<button
									key={a}
									type="button"
									title={label}
									aria-label={label}
									aria-pressed={alignment === a}
									onClick={() => setAlignment(a)}
									className={`flex h-8 flex-1 cursor-pointer items-center justify-center rounded-lg border transition-all duration-150 ${
										alignment === a
											? "border-stroke-soft-200 bg-bg-strong-950 text-white"
											: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
									}`}
								>
									<Icon className="h-3.5 w-3.5" strokeWidth={2} />
								</button>
							))}
						</div>
					</div>

					{/* Link colour — only when a link is active */}
					{isLinkActive && (
						<ColorRow
							label="Link color"
							value={linkColor}
							onChange={setLinkColor}
						/>
					)}
				</div>
			)}
		</Inspector.Text>
	);
}
