import { Inspector } from "@react-email/editor/ui";

import { ColorPicker } from "./color-picker";
import { MarkButton } from "./mark-button";
import { NumberField } from "./number-field";
import { Row } from "./row";

export const EmailInspector = () => {
	return (
		<aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto p-3 text-xs">
			<aside className="flex w-60 shrink-0 flex-col gap-3 overflow-y-auto p-4 text-xs">
				<Inspector.Root>
					<Inspector.Document>
						{({ findStyleValue, setGlobalStyle }) => (
							<fieldset className="m-0 rounded p-2">
								<legend className="px-1 font-bold text-xs">Document</legend>
								<Row label="Background">
									<ColorPicker
										value={String(
											findStyleValue("body", "backgroundColor") ?? "",
										)}
										onChange={(v) =>
											setGlobalStyle("body", "backgroundColor", v)
										}
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
										onChange={(v) =>
											setGlobalStyle("container", "borderRadius", v)
										}
										unit="px"
									/>
								</Row>
							</fieldset>
						)}
					</Inspector.Document>

					<Inspector.Node>
						{({ nodeType, getStyle, setStyle, getAttr, setAttr }) => (
							<fieldset className="m-0 rounded border border-(--re-border) p-2">
								<legend className="px-1 font-bold text-xs">{nodeType}</legend>
								<Row label="Background">
									<ColorPicker
										value={String(getStyle("backgroundColor") ?? "")}
										onChange={(v) => setStyle("backgroundColor", v)}
									/>
								</Row>
								<Row label="Padding">
									<NumberField
										value={getStyle("paddingTop")}
										onChange={(v) => setStyle("paddingTop", v)}
										unit="px"
									/>
								</Row>
								{nodeType === "image" && (
									<>
										<Row label="Width">
											<NumberField
												value={getAttr("width") as number}
												onChange={(v) => setAttr("width", v)}
												unit="px"
											/>
										</Row>
										<Row label="Alt">
											<input
												type="text"
												value={String(getAttr("alt") ?? "")}
												onChange={(e) => setAttr("alt", e.target.value)}
												className="w-full rounded border border-(--re-border) bg-transparent px-1.5 py-1 text-xs"
											/>
										</Row>
									</>
								)}
								{nodeType === "button" && (
									<Row label="Link">
										<input
											type="text"
											value={String(getAttr("href") ?? "")}
											onChange={(e) => setAttr("href", e.target.value)}
											className="w-full rounded border border-(--re-border) bg-transparent px-1.5 py-1 text-xs"
										/>
									</Row>
								)}
							</fieldset>
						)}
					</Inspector.Node>

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
							<fieldset className="m-0 rounded border border-(--re-border) p-2">
								<legend className="px-1 font-bold text-xs">Text</legend>
								<Row label="Format">
									<span className="flex gap-0.5">
										<MarkButton
											label="B"
											active={marks.bold}
											onClick={() => toggleMark("bold")}
											className="font-bold"
										/>
										<MarkButton
											label="I"
											active={marks.italic}
											onClick={() => toggleMark("italic")}
											className="italic"
										/>
										<MarkButton
											label="U"
											active={marks.underline}
											onClick={() => toggleMark("underline")}
											className="underline"
										/>
										<MarkButton
											label="S"
											active={marks.strike}
											onClick={() => toggleMark("strike")}
											className="line-through"
										/>
									</span>
								</Row>
								<Row label="Align">
									<span className="flex gap-0.5">
										{(["left", "center", "right"] as const).map((a) => (
											<MarkButton
												key={a}
												label={a[0].toUpperCase()}
												active={alignment === a}
												onClick={() => setAlignment(a)}
											/>
										))}
									</span>
								</Row>
								<Row label="Color">
									<ColorPicker
										value={String(getStyle("color") ?? "")}
										onChange={(v) => setStyle("color", v)}
									/>
								</Row>
								<Row label="Size">
									<NumberField
										value={getStyle("fontSize")}
										onChange={(v) => setStyle("fontSize", v)}
										unit="px"
									/>
								</Row>
								{isLinkActive && (
									<Row label="Link color">
										<ColorPicker value={linkColor} onChange={setLinkColor} />
									</Row>
								)}
							</fieldset>
						)}
					</Inspector.Text>
				</Inspector.Root>
			</aside>
		</aside>
	);
};
