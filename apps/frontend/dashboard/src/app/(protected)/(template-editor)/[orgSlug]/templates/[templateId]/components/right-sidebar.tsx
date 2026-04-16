"use client";

import { useEditorStore } from "../editor/use-editor-store";
import { BlockProperties } from "./right/block-properties";
import { GlobalSettings } from "./right/global-settings";
import { RightAction } from "./right/right-action";

export const RightSidebar = () => {
	const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
	const getSelectedBlock = useEditorStore((s) => s.getSelectedBlock);

	const selectedBlock = selectedBlockId ? getSelectedBlock() : null;

	return (
		<aside className="flex w-80 flex-col border-stroke-soft-100/50 border-l bg-bg-white-0">
			<RightAction />
			<div className="flex-1 overflow-y-auto">
				{selectedBlock ? (
					<BlockProperties block={selectedBlock} />
				) : (
					<GlobalSettings />
				)}
			</div>
		</aside>
	);
};
