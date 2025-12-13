"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    createCommand,
    type LexicalCommand,
} from "lexical";
import {
    $createEmailButtonNode,
    $createEmailImageNode,
    $createEmailDividerNode,
    $createEmailSpacerNode,
} from "../nodes";

export type InsertBlockPayload = {
    blockType: "button" | "image" | "divider" | "spacer";
};

export const INSERT_BLOCK_COMMAND: LexicalCommand<InsertBlockPayload> =
    createCommand("INSERT_BLOCK_COMMAND");

export function BlockInsertPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_BLOCK_COMMAND,
            (payload: InsertBlockPayload) => {
                editor.update(() => {
                    const selection = $getSelection();
                    if (!$isRangeSelection(selection)) return false;

                    let node;
                    switch (payload.blockType) {
                        case "button":
                            node = $createEmailButtonNode();
                            break;
                        case "image":
                            node = $createEmailImageNode();
                            break;
                        case "divider":
                            node = $createEmailDividerNode();
                            break;
                        case "spacer":
                            node = $createEmailSpacerNode();
                            break;
                        default:
                            return false;
                    }

                    selection.insertNodes([node]);
                    return true;
                });
                return true;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor]);

    return null;
}
