import { Inspector } from "@react-email/editor/ui";
import { ColorRow } from "./color-row";
import { ScrubRow } from "./scrub-field";
import { SectionHeader } from "./section-header";

/* ------------------------------------------------------------------ */
/* Document panel                                                       */
/* ------------------------------------------------------------------ */
export function DocumentPanel() {
	return (
		<Inspector.Document>
			{({ findStyleValue, setGlobalStyle }) => (
				<div>
					<SectionHeader label="Document" />
					<ScrubRow
						label="Container width"
						value={findStyleValue("container", "width")}
						onChange={(v) => setGlobalStyle("container", "width", v)}
						min={200}
						max={800}
						suffix="px"
					/>
					<ScrubRow
						label="Border radius"
						value={findStyleValue("container", "borderRadius")}
						onChange={(v) => setGlobalStyle("container", "borderRadius", v)}
						min={0}
						max={64}
						suffix="px"
					/>
					<ScrubRow
						label="Line height"
						value={findStyleValue("body", "lineHeight")}
						onChange={(v) => setGlobalStyle("body", "lineHeight", v)}
						min={80}
						max={300}
					/>
					<ColorRow
						label="Text color"
						value={String(findStyleValue("body", "color") ?? "")}
						onChange={(v) => setGlobalStyle("body", "color", v)}
					/>
				</div>
			)}
		</Inspector.Document>
	);
}
