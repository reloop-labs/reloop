"use client";

import { useMemo, useRef, useState } from "react";
import {
	type Template,
	useTemplatesQuery,
} from "#/features/templates/hooks/use-templates-query";
import type { SendEmailNodeData } from "../../workflow-types";
import { useNodeEditor } from "../node-editor-context";
import {
	TemplatePicker,
	useTemplateStepCards,
} from "../send-email-config-form";
import { EditorShell } from "./editor-shell";

/**
 * Send email step. Until a template is picked, the input searches the
 * template grid (thumbnails) shown below. Once picked, the top card holds the
 * template's details ("‹ name", From / Reply-To, Subject, Preview) and the
 * dropdown its preview with Publish for drafts; "‹ name" goes back to the grid.
 */
export const SendEmailEditor = ({
	nodeId,
	data,
}: {
	nodeId: string;
	data: SendEmailNodeData;
}) => {
	const { updateNode, closeEditor } = useNodeEditor();
	const inputRef = useRef<HTMLInputElement>(null);
	// null until the user types; the input shows the chosen template meanwhile.
	const [query, setQuery] = useState<string | null>(null);
	const [picking, setPicking] = useState(!data.templateId);

	const templatesQuery = useTemplatesQuery();
	const templates = templatesQuery.data?.templates ?? [];
	const current = templates.find((t) => t.id === data.templateId);
	const showGrid = picking || !data.templateId || query !== null;
	// Same two cards as the step at rest (details, then preview), just live,
	// so opening the editor doesn't move or restyle anything.
	const cards = useTemplateStepCards({
		templateId: data.templateId ?? "",
		templateName: current?.name ?? "Template",
		initialStatus: current?.status,
		onBack: () => setPicking(true),
	});

	const search = (query ?? "").trim();
	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		const live = templates.filter((t) => t.status !== "archived");
		if (!q) return live;
		return live.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				(t.subject?.toLowerCase().includes(q) ?? false),
		);
	}, [templates, search]);

	const choose = (template: Template) => {
		updateNode(nodeId, { ...data, templateId: template.id });
		// Stay open on the template's details so the user can check them.
		setQuery(null);
		setPicking(false);
	};

	return (
		<EditorShell
			removable
			title="Send email"
			onBack={closeEditor}
			icon="mail-single"
			inputRef={inputRef}
			value={query ?? (showGrid ? "" : (current?.name ?? ""))}
			caretAtEnd={query === null}
			onChange={setQuery}
			placeholder="Search templates"
			onKeyDown={(e) => {
				if (e.key !== "Enter" || !showGrid) return;
				e.preventDefault();
				const first = filtered[0];
				if (first) choose(first);
			}}
			onSubmit={() => {
				const first = filtered[0];
				if (showGrid && first) choose(first);
			}}
			submitDisabled={showGrid && filtered.length === 0}
			cardContent={showGrid ? undefined : cards.cardContent}
			belowCard={showGrid ? undefined : cards.belowCard}
		>
			{showGrid ? (
				// Grows to fit; never scrolls.
				<div className="p-3">
					<TemplatePicker
						value={data}
						search={search}
						onChange={(next) => updateNode(nodeId, next)}
						onSelect={choose}
					/>
				</div>
			) : null}
		</EditorShell>
	);
};
