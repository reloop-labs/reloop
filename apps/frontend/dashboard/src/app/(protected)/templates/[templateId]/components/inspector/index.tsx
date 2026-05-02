import { Inspector } from "@react-email/editor/ui";

import { AlignButtons } from "./align-buttons";
import { ColorPicker } from "./color-picker";
import { Divider } from "./divider";
import { ImageSrcControl } from "./image-src-control";
import { LetterSpacingField } from "./letter-spacing-field";
import { LineHeightField } from "./line-height-field";
import { MarkButton } from "./mark-button";
import { NumberField } from "./number-field";
import { Row } from "./row";
import { SpacingControl } from "./spacing-control";
import { ToggleSwitch } from "./toggle-switch";
import { UrlInput } from "./url-input";

/* ------------------------------------------------------------------ */
/* Helper: a section block matching the existing inspector style        */
/* ------------------------------------------------------------------ */
function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-0">
			<span className="mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-widest text-(--re-text-muted)">
				{title}
			</span>
			{children}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Document panel — global email styles                                 */
/* ------------------------------------------------------------------ */
function DocumentPanel() {
	return (
		<Inspector.Document>
			{({ findStyleValue, setGlobalStyle }) => (
				<Section title="Document">
					<Row label="Background">
						<ColorPicker
							value={String(findStyleValue("body", "backgroundColor") ?? "")}
							onChange={(v) => setGlobalStyle("body", "backgroundColor", v)}
						/>
					</Row>
					<Row label="Container width">
						<NumberField
							value={findStyleValue("container", "width")}
							onChange={(v) => setGlobalStyle("container", "width", v)}
							unit="px"
						/>
					</Row>
					<Row label="Container radius">
						<NumberField
							value={findStyleValue("container", "borderRadius")}
							onChange={(v) => setGlobalStyle("container", "borderRadius", v)}
							unit="px"
						/>
					</Row>
					<Row label="Container bg">
						<ColorPicker
							value={String(
								findStyleValue("container", "backgroundColor") ?? "",
							)}
							onChange={(v) =>
								setGlobalStyle("container", "backgroundColor", v)
							}
						/>
					</Row>
					<Divider label="Typography defaults" />
					<Row label="Text color">
						<ColorPicker
							value={String(findStyleValue("body", "color") ?? "")}
							onChange={(v) => setGlobalStyle("body", "color", v)}
						/>
					</Row>
					<Row label="Line height">
						<NumberField
							value={findStyleValue("body", "lineHeight")}
							onChange={(v) => setGlobalStyle("body", "lineHeight", v)}
						/>
					</Row>
				</Section>
			)}
		</Inspector.Document>
	);
}

/* ------------------------------------------------------------------ */
/* Node panel — selected block element styles                           */
/* ------------------------------------------------------------------ */
function NodePanel() {
	return (
		<Inspector.Node>
			{({ nodeType, getStyle, setStyle, batchSetStyle, getAttr, setAttr }) => (
				<div className="flex flex-col gap-3">
					{/* ── Layout ── */}
					<Section title={nodeType}>
						<Row label="Background">
							<ColorPicker
								value={String(getStyle("backgroundColor") ?? "")}
								onChange={(v) => setStyle("backgroundColor", v)}
							/>
						</Row>
					</Section>

					{/* ── Spacing ── */}
					<Section title="Padding">
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
					</Section>

					{/* ── Image-specific ── */}
					{nodeType === "image" && (
						<Section title="Image">
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
						</Section>
					)}

					{/* ── Button-specific ── */}
					{nodeType === "button" && (
						<Section title="Button link">
							<Row label="URL">
								<UrlInput
									value={String(getAttr("href") ?? "")}
									onChange={(v) => setAttr("href", v)}
								/>
							</Row>
							<Row label="Target">
								<ToggleSwitch
									checked={getAttr("target") === "_blank"}
									onChange={(open) =>
										setAttr("target", open ? "_blank" : "_self")
									}
									label="Open in new tab"
								/>
							</Row>
						</Section>
					)}

					{/* ── Section/Divider-specific ── */}
					{nodeType === "section" && (
						<Section title="Section">
							<Row label="Width">
								<NumberField
									value={getStyle("width") as number}
									onChange={(v) => setStyle("width", v as number)}
									unit="px"
								/>
							</Row>
						</Section>
					)}
				</div>
			)}
		</Inspector.Node>
	);
}

/* ------------------------------------------------------------------ */
/* Text panel — active text selection styles                            */
/* ------------------------------------------------------------------ */
function TextPanel() {
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
				<div className="flex flex-col gap-3">
					{/* ── Formatting marks ── */}
					<Section title="Text">
						<Row label="Format">
							<span className="flex gap-0.5">
								<MarkButton
									label="B"
									active={marks.bold ?? false}
									onClick={() => toggleMark("bold")}
									className="font-bold"
								/>
								<MarkButton
									label="I"
									active={marks.italic ?? false}
									onClick={() => toggleMark("italic")}
									className="italic"
								/>
								<MarkButton
									label="U"
									active={marks.underline ?? false}
									onClick={() => toggleMark("underline")}
									className="underline"
								/>
								<MarkButton
									label="S"
									active={marks.strike ?? false}
									onClick={() => toggleMark("strike")}
									className="line-through"
								/>
							</span>
						</Row>
						<Row label="Align">
							<AlignButtons
								value={alignment as "left" | "center" | "right" | "justify"}
								onChange={(v) => setAlignment(v)}
							/>
						</Row>
					</Section>

					{/* ── Typography ── */}
					<Section title="Typography">
						<Row label="Size">
							<NumberField
								value={getStyle("fontSize")}
								onChange={(v) => setStyle("fontSize", v as number)}
								unit="px"
							/>
						</Row>
						<Row label="Line height">
							<LineHeightField
								value={
									getStyle("lineHeight") !== undefined
										? Number(getStyle("lineHeight"))
										: ""
								}
								unit=""
								onChange={(v) => setStyle("lineHeight", v as number)}
								onUnitChange={() => {}}
							/>
						</Row>
						<Row label="Letter spacing">
							<LetterSpacingField
								value={
									getStyle("letterSpacing") !== undefined
										? Number(getStyle("letterSpacing"))
										: ""
								}
								onChange={(v) => setStyle("letterSpacing", v as number)}
							/>
						</Row>
					</Section>

					{/* ── Link colour (shown only when a link is selected) ── */}
					{isLinkActive && (
						<Section title="Link">
							<Row label="Color">
								<ColorPicker value={linkColor} onChange={setLinkColor} />
							</Row>
						</Section>
					)}
				</div>
			)}
		</Inspector.Text>
	);
}

/* ------------------------------------------------------------------ */
/* Root inspector                                                        */
/* ------------------------------------------------------------------ */
export const EmailInspector = () => {
	return (
		<aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto p-3 text-xs">
			<Inspector.Root>
				<Inspector.Breadcrumb />
				<DocumentPanel />
				<NodePanel />
				<TextPanel />
			</Inspector.Root>
		</aside>
	);
};
