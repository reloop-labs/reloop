"use client";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createEditorConfig } from "./lexical-config";
import { ToolbarPlugin, DragDropPlugin, BlockInsertPlugin } from "./plugins";
import { useCallback, useEffect } from "react";
import type { EditorState } from "lexical";

interface EmailEditorProps {
    initialContent?: string;
    onContentChange?: (content: string) => void;
    templateId: string;
}

function EditorContent({
    onContentChange,
}: {
    onContentChange?: (content: string) => void;
}) {
    const handleChange = useCallback(
        (editorState: EditorState) => {
            if (onContentChange) {
                const json = JSON.stringify(editorState.toJSON());
                onContentChange(json);
            }
        },
        [onContentChange],
    );

    return (
        <>
            <ToolbarPlugin />
            <div className="relative min-h-[400px]">
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="email-editor-content min-h-[400px] p-6 outline-none"
                            aria-placeholder="Start typing or drag blocks here..."
                            placeholder={
                                <div className="email-editor-placeholder pointer-events-none absolute top-6 left-6 text-gray-400">
                                    Start typing or drag blocks from the left panel...
                                </div>
                            }
                        />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            <HistoryPlugin />
            <BlockInsertPlugin />
            <DragDropPlugin />
            <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
        </>
    );
}

function InitializeEditorPlugin({ content }: { content?: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (content) {
            try {
                const parsedState = JSON.parse(content);
                const editorState = editor.parseEditorState(parsedState);
                editor.setEditorState(editorState);
            } catch (e) {
                console.error("Failed to parse initial content:", e);
            }
        }
    }, [editor, content]);

    return null;
}

export function EmailEditor({
    initialContent,
    onContentChange,
    templateId,
}: EmailEditorProps) {
    const config = createEditorConfig(`template-editor-${templateId}`);

    return (
        <div className="email-editor flex flex-col rounded-lg border border-stroke-soft-200 bg-white">
            <LexicalComposer initialConfig={config}>
                <InitializeEditorPlugin content={initialContent} />
                <EditorContent onContentChange={onContentChange} />
            </LexicalComposer>
        </div>
    );
}
