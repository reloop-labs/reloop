"use client";

import {
	AlignCenterIcon,
	AlignLeftIcon,
	AlignRightIcon,
	BubbleMenu,
	useBubbleMenuContext,
} from "@react-email/editor/ui";
import { PluginKey } from "@tiptap/pm/state";
import { useEditorState } from "@tiptap/react";
import React, { useState } from "react";
import {
	EMAIL_BUBBLE_HIDE_NODES,
	emailTextBubbleTrigger,
} from "../../utils/email-slash-command-plugin";
import {
	applyTextAlignment,
	getResolvedAlignment,
} from "../../utils/resolve-inspector-text-style";

const textBubblePluginKey = new PluginKey("emailTextBubbleMenu");

function EmailAlignLeftItem() {
	const { editor } = useBubbleMenuContext();
	const activeAlignment = useEditorState({
		editor,
		selector: ({ editor: cur }) => getResolvedAlignment(cur, "left"),
	});
	return (
		<BubbleMenu.Item
			name="align-left"
			isActive={activeAlignment === "left"}
			onCommand={() => applyTextAlignment(editor, "left")}
		>
			<AlignLeftIcon />
		</BubbleMenu.Item>
	);
}

function EmailAlignCenterItem() {
	const { editor } = useBubbleMenuContext();
	const activeAlignment = useEditorState({
		editor,
		selector: ({ editor: cur }) => getResolvedAlignment(cur, "left"),
	});
	return (
		<BubbleMenu.Item
			name="align-center"
			isActive={activeAlignment === "center"}
			onCommand={() => applyTextAlignment(editor, "center")}
		>
			<AlignCenterIcon />
		</BubbleMenu.Item>
	);
}

function EmailAlignRightItem() {
	const { editor } = useBubbleMenuContext();
	const activeAlignment = useEditorState({
		editor,
		selector: ({ editor: cur }) => getResolvedAlignment(cur, "left"),
	});
	return (
		<BubbleMenu.Item
			name="align-right"
			isActive={activeAlignment === "right"}
			onCommand={() => applyTextAlignment(editor, "right")}
		>
			<AlignRightIcon />
		</BubbleMenu.Item>
	);
}

function EmailBubbleMenuItems({
	isNodeSelectorOpen,
	setIsNodeSelectorOpen,
	isLinkSelectorOpen,
	setIsLinkSelectorOpen,
}: {
	isNodeSelectorOpen: boolean;
	setIsNodeSelectorOpen: (v: boolean) => void;
	isLinkSelectorOpen: boolean;
	setIsLinkSelectorOpen: (v: boolean) => void;
}) {
	const { editor } = useBubbleMenuContext();
	const isCodeActive = useEditorState({
		editor,
		selector: ({ editor: cur }) => cur?.isActive("code") ?? false,
	});

	if (isCodeActive) {
		return (
			<>
				<BubbleMenu.NodeSelector
					open={isNodeSelectorOpen}
					onOpenChange={setIsNodeSelectorOpen}
				/>
				<BubbleMenu.Code />
			</>
		);
	}

	return (
		<>
			<BubbleMenu.NodeSelector
				open={isNodeSelectorOpen}
				onOpenChange={setIsNodeSelectorOpen}
			/>
			<BubbleMenu.LinkSelector
				open={isLinkSelectorOpen}
				onOpenChange={setIsLinkSelectorOpen}
			/>
			<BubbleMenu.ItemGroup>
				<BubbleMenu.Bold />
				<BubbleMenu.Italic />
				<BubbleMenu.Underline />
				<BubbleMenu.Strike />
				<BubbleMenu.Code />
				<BubbleMenu.Uppercase />
			</BubbleMenu.ItemGroup>
			<BubbleMenu.ItemGroup>
				<EmailAlignLeftItem />
				<EmailAlignCenterItem />
				<EmailAlignRightItem />
			</BubbleMenu.ItemGroup>
		</>
	);
}

export function EmailTextBubbleMenu() {
	const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
	const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);

	return (
		<BubbleMenu
			pluginKey={textBubblePluginKey}
			hideWhenActiveNodes={[...EMAIL_BUBBLE_HIDE_NODES]}
			trigger={emailTextBubbleTrigger}
			onHide={() => {
				setIsNodeSelectorOpen(false);
				setIsLinkSelectorOpen(false);
			}}
		>
			<EmailBubbleMenuItems
				isNodeSelectorOpen={isNodeSelectorOpen}
				setIsNodeSelectorOpen={setIsNodeSelectorOpen}
				isLinkSelectorOpen={isLinkSelectorOpen}
				setIsLinkSelectorOpen={setIsLinkSelectorOpen}
			/>
		</BubbleMenu>
	);
}
