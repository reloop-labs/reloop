"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useCallback, useEffect, useState } from "react";
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
    COMMAND_PRIORITY_LOW,
} from "lexical";
import { $createHeadingNode, $isHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_BLOCK_COMMAND } from "./BlockInsertPlugin";

export function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    useEffect(() => {
        return editor.registerCommand(
            CAN_UNDO_COMMAND,
            (payload) => {
                setCanUndo(payload);
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            CAN_REDO_COMMAND,
            (payload) => {
                setCanRedo(payload);
                return false;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    setIsBold(selection.hasFormat("bold"));
                    setIsItalic(selection.hasFormat("italic"));
                    setIsUnderline(selection.hasFormat("underline"));
                }
            });
        });
    }, [editor]);

    const formatHeading = useCallback(
        (headingType: HeadingTagType) => {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingType));
                }
            });
        },
        [editor],
    );

    return (
        <div className="flex items-center gap-1 border-b border-stroke-soft-200 bg-bg-white-0 px-2 py-1.5">
            {/* Undo/Redo */}
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                disabled={!canUndo}
            >
                <Icon name="undo" className="h-4 w-4" />
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                disabled={!canRedo}
            >
                <Icon name="redo" className="h-4 w-4" />
            </Button.Root>

            <div className="mx-1 h-4 w-px bg-stroke-soft-200" />

            {/* Headings */}
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() => formatHeading("h1")}
            >
                H1
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() => formatHeading("h2")}
            >
                H2
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() => formatHeading("h3")}
            >
                H3
            </Button.Root>

            <div className="mx-1 h-4 w-px bg-stroke-soft-200" />

            {/* Text formatting */}
            <Button.Root
                variant="neutral"
                mode={isBold ? "filled" : "ghost"}
                size="xxsmall"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            >
                <Icon name="bold" className="h-4 w-4" />
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode={isItalic ? "filled" : "ghost"}
                size="xxsmall"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
            >
                <Icon name="italic" className="h-4 w-4" />
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode={isUnderline ? "filled" : "ghost"}
                size="xxsmall"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
            >
                <Icon name="underline" className="h-4 w-4" />
            </Button.Root>

            <div className="mx-1 h-4 w-px bg-stroke-soft-200" />

            {/* Insert blocks */}
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() =>
                    editor.dispatchCommand(INSERT_BLOCK_COMMAND, { blockType: "button" })
                }
            >
                <Icon name="square" className="h-4 w-4" />
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() =>
                    editor.dispatchCommand(INSERT_BLOCK_COMMAND, { blockType: "image" })
                }
            >
                <Icon name="image" className="h-4 w-4" />
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() =>
                    editor.dispatchCommand(INSERT_BLOCK_COMMAND, { blockType: "divider" })
                }
            >
                <Icon name="minus" className="h-4 w-4" />
            </Button.Root>
            <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() =>
                    editor.dispatchCommand(INSERT_BLOCK_COMMAND, { blockType: "spacer" })
                }
            >
                <Icon name="move-vertical" className="h-4 w-4" />
            </Button.Root>
        </div>
    );
}
