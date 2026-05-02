"use client";

import { Inspector } from "@react-email/editor/ui";
import { useCurrentEditor } from "@tiptap/react";
import { Paintbrush, Square } from "lucide-react";
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
/* Shared card wrapper used for every section                           */
/* ------------------------------------------------------------------ */
function InspectorCard({ children }: { children: React.ReactNode }) {
	return (
		<div className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0">
			{children}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Root inspector                                                       */
/* ------------------------------------------------------------------ */
export const EmailInspector = () => {
	const [activeNodeType, setActiveNodeType] = useState<NodeTypePill>("Body");
	const { editor } = useCurrentEditor();
	if (!editor) return null;

	return (
		<Inspector.Root>
			{/* ── Breadcrumb ── */}
			<Breadcrumb />

			{/* ── Node-type segmented control (text nodes only) ── */}
			<Inspector.Node>
				{({ nodeType }) => {
					const isTextRelated = ["text", "paragraph", "heading"].includes(
						nodeType,
					);
					if (!isTextRelated) return null;
					return (
						<div className="px-4 pb-3">
							<NodeTypePills
								active={activeNodeType}
								onChange={setActiveNodeType}
							/>
						</div>
					);
				}}
			</Inspector.Node>

			{/* ── Sections as cards ── */}
			<div className="flex flex-col gap-3 px-4 pb-6">
				{/* Text card */}
				<InspectorCard>
					<TextPanel />
				</InspectorCard>

				{/* Link card (button nodes only) */}
				<Inspector.Node>
					{({ nodeType, getAttr, setAttr }) =>
						nodeType === "button" ? (
							<InspectorCard>
								<SectionHeader label="Link" />
								<PropRow label="URL">
									<UrlInput
										value={String(getAttr("href") ?? "")}
										onChange={(v) => setAttr("href", v)}
									/>
								</PropRow>
								<div className="h-2" />
							</InspectorCard>
						) : null
					}
				</Inspector.Node>

				{/* Spacing card */}
				<InspectorCard>
					<NodePanel />
				</InspectorCard>

				{/* Background card */}
				<Inspector.Node>
					{({ getStyle, setStyle }) => (
						<InspectorCard>
							<SectionHeader label="Background" icon={Paintbrush} />
							<ColorRow
								label="Color"
								value={String(getStyle("backgroundColor") ?? "")}
								onChange={(v) => setStyle("backgroundColor", v)}
							/>
							<div className="h-2" />
						</InspectorCard>
					)}
				</Inspector.Node>

				{/* Border card */}
				<Inspector.Node>
					{({ getStyle, setStyle }) => (
						<InspectorCard>
							<SectionHeader label="Border" icon={Square} />
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
							<div className="h-2" />
						</InspectorCard>
					)}
				</Inspector.Node>

				{/* Document card */}
				<InspectorCard>
					<DocumentPanel />
				</InspectorCard>
			</div>
		</Inspector.Root>
	);
};
