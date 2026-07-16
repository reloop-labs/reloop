import { Inspector } from "@react-email/editor/ui";
import { ColorRow } from "./color-row";
import { NumInput } from "./num-input";
import { PropRow } from "./prop-row";
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
					<ColorRow
						label="Background"
						value={String(findStyleValue("body", "backgroundColor") ?? "")}
						onChange={(v) => setGlobalStyle("body", "backgroundColor", v)}
					/>
					<PropRow label="Container width">
						<NumInput
							value={findStyleValue("container", "width")}
							onChange={(v) => setGlobalStyle("container", "width", v)}
							unit="px"
						/>
					</PropRow>
					<PropRow label="Border radius">
						<NumInput
							value={findStyleValue("container", "borderRadius")}
							onChange={(v) => setGlobalStyle("container", "borderRadius", v)}
							unit="px"
						/>
					</PropRow>
					<ColorRow
						label="Container bg"
						value={String(findStyleValue("container", "backgroundColor") ?? "")}
						onChange={(v) => setGlobalStyle("container", "backgroundColor", v)}
					/>
					<PropRow label="Line height">
						<NumInput
							value={findStyleValue("body", "lineHeight")}
							onChange={(v) => setGlobalStyle("body", "lineHeight", v)}
						/>
					</PropRow>
					<ColorRow
						label="Text color"
						value={String(findStyleValue("body", "color") ?? "")}
						onChange={(v) => setGlobalStyle("body", "color", v)}
					/>
					{/* Bottom spacing inside card */}
				</div>
			)}
		</Inspector.Document>
	);
}
