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
import { TypographyControls } from "./typography/typography-controls";

/* ------------------------------------------------------------------ */
/* Text panel                                                           */
/* ------------------------------------------------------------------ */


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

					{/* Marks + alignment */}
					<TypographyControls
						marks={marks}
						toggleMark={toggleMark}
						alignment={alignment}
						setAlignment={setAlignment}
					/>

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
