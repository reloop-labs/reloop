"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import * as Input from "@reloop/ui/input";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import {
	BLOCK_DEFINITIONS,
	CATEGORY_LABELS,
	CATEGORY_ORDER,
} from "../editor/block-types";
import { useEditorStore } from "../editor/use-editor-store";
import { BlockTile } from "./left/block-tile";
import { RowTileGrid } from "./left/row-tile";

const ContentTab = () => {
	const groupedBlocks = CATEGORY_ORDER.map((category) => ({
		category,
		label: CATEGORY_LABELS[category],
		blocks: BLOCK_DEFINITIONS.filter((b) => b.category === category),
	}));

	return (
		<div className="flex flex-col gap-4 p-3">
			{groupedBlocks.map((group) => (
				<div key={group.category}>
					<p className="mb-2 px-1 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider">
						{group.label}
					</p>
					<div className="grid grid-cols-3 gap-0.5">
						{group.blocks.map((block) => (
							<BlockTile key={block.type} definition={block} />
						))}
					</div>
				</div>
			))}
		</div>
	);
};

const RowsTab = () => {
	return (
		<div className="p-3">
			<p className="mb-2 px-1 font-medium text-[11px] text-text-soft-400 uppercase tracking-wider">
				Layouts
			</p>
			<RowTileGrid />
		</div>
	);
};

export const LeftSidebar = () => {
	const templateName = useEditorStore((s) => s.templateName);
	const setTemplateName = useEditorStore((s) => s.setTemplateName);

	return (
		<aside className="flex w-64 flex-col border-stroke-soft-100/50 border-r bg-bg-white-0">
			{/* Header */}
			<div className="space-y-3 border-stroke-soft-100/50 border-b p-4">
				<AnimatedBackButton />
				<Input.Root size="small">
					<Input.Wrapper>
						<Input.Input
							placeholder="Untitled Template"
							value={templateName}
							onChange={(e) => setTemplateName(e.target.value)}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			{/* Tabbed content */}
			<div className="flex-1 overflow-y-auto">
				<TabMenuHorizontal.Root defaultValue="content">
					<div className="sticky top-0 z-10 bg-bg-white-0 px-3">
						<TabMenuHorizontal.List>
							<TabMenuHorizontal.Trigger value="content">
								Content
							</TabMenuHorizontal.Trigger>
							<TabMenuHorizontal.Trigger value="rows">
								Rows
							</TabMenuHorizontal.Trigger>
						</TabMenuHorizontal.List>
					</div>

					<TabMenuHorizontal.Content value="content">
						<ContentTab />
					</TabMenuHorizontal.Content>

					<TabMenuHorizontal.Content value="rows">
						<RowsTab />
					</TabMenuHorizontal.Content>
				</TabMenuHorizontal.Root>
			</div>
		</aside>
	);
};
