"use client";

import { Inspector } from "@react-email/editor/ui";
import * as DividerPrimitive from "@reloop/ui/divider";
import { useCurrentEditor } from "@tiptap/react";
import { useState } from "react";
import Breadcrumb from "./breadcrumb";
import { ColorRow } from "./color-row";
import { DocumentPanel } from "./document-panel";
import { NodePanel } from "./node-panel";
import { type NodeTypePill, NodeTypePills } from "./node-type-pills";
import { NumInput } from "./num-input";
import { PropRow } from "./prop-row";
import { SectionHeader } from "./section-header";
import { TextPanel } from "./text-panel";
import { UrlInput } from "./url-input";

/* ------------------------------------------------------------------ */
/* Root inspector — matches the reference image layout exactly          */
/* ------------------------------------------------------------------ */
export const EmailInspector = () => {
	const [activeNodeType, setActiveNodeType] = useState<NodeTypePill>("Body");
	const { editor } = useCurrentEditor();
	if (!editor) return null;
	return (
		<Inspector.Root>
			<Breadcrumb />
			<Inspector.Node>
				{({ nodeType }) => {
					const isTextRelated = ["text", "paragraph", "heading"].includes(
						nodeType,
					);
					if (!isTextRelated) return null;
					return (
						<div className="border-stroke-soft-200 border-b py-3">
							<NodeTypePills
								active={activeNodeType}
								onChange={setActiveNodeType}
							/>
						</div>
					);
				}}
			</Inspector.Node>

			{/* ── Sections ── */}
			<div className="flex flex-col">
				<TextPanel />

				{/* Link section */}
				<Inspector.Node>
					{({ nodeType, getAttr, setAttr }) =>
						nodeType === "button" ? (
							<div>
								<SectionHeader label="Link" />
								<div className="pb-3">
									<PropRow label="URL">
										<UrlInput
											value={String(getAttr("href") ?? "")}
											onChange={(v) => setAttr("href", v)}
										/>
									</PropRow>
								</div>
								<DividerPrimitive.Root variant="line" />
							</div>
						) : null
					}
				</Inspector.Node>

				<NodePanel />

				{/* Background section */}
				<Inspector.Node>
					{({ getStyle, setStyle }) => (
						<div>
							<SectionHeader label="Background" />
							<div className="pb-3">
								<ColorRow
									label="Color"
									value={String(getStyle("backgroundColor") ?? "")}
									onChange={(v) => setStyle("backgroundColor", v)}
								/>
							</div>
							<DividerPrimitive.Root variant="line" />
						</div>
					)}
				</Inspector.Node>

				{/* Border section */}
				<Inspector.Node>
					{({ getStyle, setStyle }) => (
						<div>
							<SectionHeader label="Border" />
							<div className="pb-3">
								<ColorRow
									label="Color"
									value={String(getStyle("borderColor") ?? "")}
									onChange={(v) => setStyle("borderColor", v)}
								/>
								<PropRow label="Width">
									<NumInput
										value={getStyle("borderWidth")}
										onChange={(v) => setStyle("borderWidth", v as number)}
										unit="px"
									/>
								</PropRow>
							</div>
							<DividerPrimitive.Root variant="line" />
						</div>
					)}
				</Inspector.Node>

				<DocumentPanel />
			</div>
		</Inspector.Root>
	);
};
