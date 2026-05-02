"use client";

import { Inspector } from "@react-email/editor/ui";
import { Icon } from "@reloop/ui/icon";
import { InputAlignment } from "./inputs/alignment";
import { InputBackgroundColor } from "./inputs/background-color";
import { InputBorder } from "./inputs/border";
import { InputMargin } from "./inputs/margin";
import { InputPadding } from "./inputs/padding";
import { InputWidth } from "./inputs/width";

export function CustomInspector({ editor }: { editor: any }) {
	return (
		<aside className="flex w-80 shrink-0 flex-col gap-6 overflow-y-auto border-stroke-soft-200 border-l bg-bg-white-0 p-4">
			<Inspector.Root>
				<Inspector.Document>
					{({ findStyleValue, setGlobalStyle }) => (
						<div className="flex flex-col gap-4">
							<h3 className="font-semibold text-sm text-text-strong-950">
								Document
							</h3>
							<InputBackgroundColor
								label="Page Background"
								value={String(findStyleValue("body", "backgroundColor") ?? "")}
								onChange={(v) => setGlobalStyle("body", "backgroundColor", v)}
							/>
							<InputWidth
								value={findStyleValue("container", "width") as number}
								onChange={(v) => setGlobalStyle("container", "width", v)}
								unit="px"
							/>
						</div>
					)}
				</Inspector.Document>

				<Inspector.Node>
					{({ nodeType, getStyle, setStyle, getAttr, setAttr }) => {
						if (!nodeType) return null;
						return (
							<div className="flex flex-col gap-6">
								<div className="flex items-center gap-2 border-stroke-soft-200 border-b pb-2">
									<Icon
										name="component"
										className="h-4 w-4 text-text-sub-600"
									/>
									<h3 className="font-semibold text-sm text-text-strong-950 capitalize">
										{nodeType}
									</h3>
								</div>

								<InputBackgroundColor
									value={String(getStyle("backgroundColor") ?? "")}
									onChange={(v) => setStyle("backgroundColor", v)}
								/>

								<InputPadding
									top={getStyle("paddingTop")}
									bottom={getStyle("paddingBottom")}
									left={getStyle("paddingLeft")}
									right={getStyle("paddingRight")}
									onChange={(side, v) => {
										const styleName =
											`padding${side.charAt(0).toUpperCase()}${side.slice(1)}` as any;
										setStyle(styleName, v);
									}}
								/>

								<InputMargin
									top={getStyle("marginTop")}
									bottom={getStyle("marginBottom")}
									left={getStyle("marginLeft")}
									right={getStyle("marginRight")}
									onChange={(side, v) => {
										const styleName =
											`margin${side.charAt(0).toUpperCase()}${side.slice(1)}` as any;
										setStyle(styleName, v);
									}}
								/>

								<InputBorder
									style={getStyle("borderStyle") as any}
									width={getStyle("borderWidth")}
									color={String(getStyle("borderColor") ?? "")}
									radius={getStyle("borderRadius")}
									onChange={(prop, v) => {
										if (prop === "style") setStyle("borderStyle", v);
										if (prop === "width") setStyle("borderWidth", v);
										if (prop === "color") setStyle("borderColor", v);
										if (prop === "radius") setStyle("borderRadius", v);
										if (prop === "topLeftRadius")
											setStyle("borderTopLeftRadius", v);
										if (prop === "topRightRadius")
											setStyle("borderTopRightRadius", v);
										if (prop === "bottomLeftRadius")
											setStyle("borderBottomLeftRadius", v);
										if (prop === "bottomRightRadius")
											setStyle("borderBottomRightRadius", v);
									}}
								/>

								{nodeType === "image" && (
									<div className="flex flex-col gap-3">
										<InputWidth
											value={getAttr("width") as number}
											onChange={(v) => setAttr("width", v)}
										/>
										<div className="flex flex-col gap-1.5">
											<label className="text-text-sub-600 text-xs">
												Alt Text
											</label>
											<input
												type="text"
												value={String(getAttr("alt") ?? "")}
												onChange={(e) => setAttr("alt", e.target.value)}
												className="w-full rounded-lg border border-stroke-soft-200 bg-transparent px-3 py-1.5 text-xs focus:border-stroke-strong-950 focus:outline-none"
												placeholder="Image description"
											/>
										</div>
									</div>
								)}

								{nodeType === "button" && (
									<div className="flex flex-col gap-1.5">
										<label className="text-text-sub-600 text-xs">
											Link URL
										</label>
										<input
											type="text"
											value={String(getAttr("href") ?? "")}
											onChange={(e) => setAttr("href", e.target.value)}
											className="w-full rounded-lg border border-stroke-soft-200 bg-transparent px-3 py-1.5 text-xs focus:border-stroke-strong-950 focus:outline-none"
											placeholder="https://example.com"
										/>
									</div>
								)}
							</div>
						);
					}}
				</Inspector.Node>

				<Inspector.Text>
					{({
						marks,
						toggleMark,
						alignment,
						setAlignment,
						getStyle,
						setStyle,
					}) => (
						<div className="flex flex-col gap-6">
							<div className="flex items-center gap-2 border-stroke-soft-200 border-b pb-2">
								<Icon name="type" className="h-4 w-4 text-text-sub-600" />
								<h3 className="font-semibold text-sm text-text-strong-950">
									Typography
								</h3>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-text-sub-600 text-xs">Format</label>
								<div className="flex gap-1">
									<FormatButton
										icon="bold"
										active={marks.bold}
										onClick={() => toggleMark("bold")}
									/>
									<FormatButton
										icon="italic"
										active={marks.italic}
										onClick={() => toggleMark("italic")}
									/>
									<FormatButton
										icon="underline"
										active={marks.underline}
										onClick={() => toggleMark("underline")}
									/>
									<FormatButton
										icon="strikethrough"
										active={marks.strike}
										onClick={() => toggleMark("strike")}
									/>
								</div>
							</div>

							<InputAlignment
								value={alignment}
								onValueChange={(v) => setAlignment(v)}
							/>

							<InputBackgroundColor
								label="Text Color"
								value={String(getStyle("color") ?? "")}
								onChange={(v) => setStyle("color", v)}
							/>

							<div className="flex flex-col gap-2">
								<label className="text-text-sub-600 text-xs">Font Size</label>
								<div className="flex items-center gap-2">
									<input
										type="number"
										value={Number.parseFloat(
											String(getStyle("fontSize") ?? "16"),
										)}
										onChange={(e) => setStyle("fontSize", e.target.value)}
										className="w-20 rounded-lg border border-stroke-soft-200 bg-transparent px-3 py-1.5 text-xs focus:border-stroke-strong-950 focus:outline-none"
									/>
									<span className="text-text-sub-600 text-xs">px</span>
								</div>
							</div>
						</div>
					)}
				</Inspector.Text>
			</Inspector.Root>
		</aside>
	);
}

function FormatButton({
	icon,
	active,
	onClick,
}: {
	icon: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
				active
					? "border-stroke-strong-950 bg-bg-strong-950 text-white"
					: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50"
			}`}
		>
			<Icon name={icon} className="h-4 w-4" />
		</button>
	);
}
