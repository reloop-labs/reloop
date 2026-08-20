import { Inspector } from "@react-email/editor/ui";
import { ColorRow } from "./color-row";
import { ScrubRow } from "./scrub-field";
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
					<SectionHeader label="Text" />

					{/* Color */}
					<ColorRow
						label="Color"
						value={String(getStyle("color") ?? "")}
						onChange={(v) => setStyle("color", v)}
					/>

					<ScrubRow
						label="Font size"
						value={getStyle("fontSize")}
						onChange={(v) => setStyle("fontSize", v as number)}
						min={8}
						max={96}
						suffix="px"
					/>
					<ScrubRow
						label="Line height"
						value={getStyle("lineHeight")}
						onChange={(v) => setStyle("lineHeight", v as number)}
						min={80}
						max={300}
						suffix="%"
					/>
					<ScrubRow
						label="Tracking"
						value={getStyle("letterSpacing")}
						onChange={(v) => setStyle("letterSpacing", v as number)}
						min={-20}
						max={40}
						suffix="px"
					/>

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
