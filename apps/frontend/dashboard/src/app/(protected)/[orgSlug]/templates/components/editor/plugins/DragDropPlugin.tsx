"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useCallback } from "react";
import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import {
    $createEmailButtonNode,
    $createEmailImageNode,
    $createEmailDividerNode,
    $createEmailSpacerNode,
} from "../nodes";

interface DragDropPluginProps {
    onDrop?: (blockType: string) => void;
}

export function DragDropPlugin({ onDrop }: DragDropPluginProps) {
    const [editor] = useLexicalComposerContext();

    const handleDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault();
            const blockType = event.dataTransfer?.getData("blockType");

            if (!blockType) return;

            editor.update(() => {
                let node;
                switch (blockType) {
                    case "heading":
                        // Use built-in heading, handled by HeadingNode
                        return;
                    case "text":
                        // Just insert at cursor, which is default paragraph
                        return;
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
                        return;
                }

                if (node) {
                    const root = $getRoot();
                    root.append(node);
                    onDrop?.(blockType);
                }
            });
        },
        [editor, onDrop],
    );

    useEffect(() => {
        const rootElement = editor.getRootElement();
        if (!rootElement) return;

        const container = rootElement.parentElement;
        if (!container) return;

        container.addEventListener("drop", handleDrop);
        container.addEventListener("dragover", (e) => e.preventDefault());

        return () => {
            container.removeEventListener("drop", handleDrop);
            container.removeEventListener("dragover", (e) => e.preventDefault());
        };
    }, [editor, handleDrop]);

    return null;
}
