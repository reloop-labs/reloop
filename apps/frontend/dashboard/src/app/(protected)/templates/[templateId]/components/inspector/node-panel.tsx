import { Inspector } from "@react-email/editor/ui";
import * as DividerPrimitive from "@reloop/ui/divider";
import { ColorRow } from "./color-row";
import { ImageSrcControl } from "./image-src-control";
import { PropRow } from "./prop-row";
import { SectionHeader } from "./section-header";
import { SpacingControl } from "./spacing-control";
import { UrlInput } from "./url-input";

/* ------------------------------------------------------------------ */
/* Node panel (spacing, image, button)                                  */
/* ------------------------------------------------------------------ */
export function NodePanel() {
	return (
		<Inspector.Node>
			{({ nodeType, getStyle, setStyle, batchSetStyle, getAttr, setAttr }) => (
				<div>
					<SectionHeader label="Spacing" />
					<div className="pb-3">
						{/* ── Background ── */}
						<ColorRow
							label="Background"
							value={String(getStyle("backgroundColor") ?? "")}
							onChange={(v) => setStyle("backgroundColor", v)}
						/>

						{/* ── Padding: 2×2 grid ── */}
						<PropRow label="Padding">
							<SpacingControl
								value={{
									top: (getStyle("paddingTop") as number) ?? "",
									right: (getStyle("paddingRight") as number) ?? "",
									bottom: (getStyle("paddingBottom") as number) ?? "",
									left: (getStyle("paddingLeft") as number) ?? "",
								}}
								onChange={({ top, right, bottom, left }) =>
									batchSetStyle([
										{ prop: "paddingTop", value: top as number },
										{ prop: "paddingRight", value: right as number },
										{ prop: "paddingBottom", value: bottom as number },
										{ prop: "paddingLeft", value: left as number },
									])
								}
							/>
						</PropRow>

						{/* ── Image ── */}
						{nodeType === "image" && (
							<ImageSrcControl
								value={{
									src: String(getAttr("src") ?? ""),
									alt: String(getAttr("alt") ?? ""),
									width: (getAttr("width") as number) ?? "",
									height: (getAttr("height") as number) ?? "",
								}}
								onChange={({ src, alt, width, height }) => {
									setAttr("src", src);
									setAttr("alt", alt);
									setAttr("width", width);
									setAttr("height", height);
								}}
							/>
						)}

						{/* ── Button ── */}
						{nodeType === "button" && (
							<PropRow label="Link">
								<UrlInput
									value={String(getAttr("href") ?? "")}
									onChange={(v) => setAttr("href", v)}
								/>
							</PropRow>
						)}
					</div>
					<DividerPrimitive.Root variant="line" />
				</div>
			)}
		</Inspector.Node>
	);
}
