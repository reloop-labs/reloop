"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef, useCallback } from "react";

interface AutoSavePluginProps {
    onSave: (content: string) => void;
    debounceMs?: number;
}

export function AutoSavePlugin({ onSave, debounceMs = 2000 }: AutoSavePluginProps) {
    const [editor] = useLexicalComposerContext();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSave = useCallback(() => {
        const editorState = editor.getEditorState();
        const json = JSON.stringify(editorState.toJSON());
        onSave(json);
    }, [editor, onSave]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(handleSave, debounceMs);
        });
    }, [editor, handleSave, debounceMs]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return null;
}
