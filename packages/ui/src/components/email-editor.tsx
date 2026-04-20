"use client";

import React, { useEffect, useState } from "react";
// We import directly from @tiptap/react for the core rendering
import { EditorContent, useEditor } from "@tiptap/react";
// We import extensions from the react-email/editor package. 
// Note: Depending on the specific release structure of @react-email/editor, 
// these imports might need adjustment (e.g. from "@react-email/editor" or "@react-email/editor/extensions").
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export interface EmailEditorProps {
  initialContent?: string;
  onUpdate?: (html: string, json: any) => void;
  className?: string;
  // This ref can be used to pass the editor instance up to the application's store (like use-editor-store)
  onEditorReady?: (editor: any) => void;
  // Callback for when the user clicks a block (Image, Button) inside TipTap
  onSelectionChange?: (nodeName: string | null, attrs: any) => void;
}

/**
 * Headless wrapper around Tiptap & React Email extensions.
 * We remove React Email's default sidebars and just provide the canvas.
 */
export function EmailEditor({
  initialContent,
  onUpdate,
  className,
  onEditorReady,
  onSelectionChange,
}: EmailEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      // TODO: Further integrate @react-email/editor specific nodes
    ],
    content: initialContent || "<p>Start building your email...</p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML(), editor.getJSON());
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange) {
        const { selection } = editor.state;

        // More robust NodeSelection check (for Images, Dividers, Buttons, etc.)
        if (selection && 'node' in selection && selection.node) {
          const node = (selection as any).node;
          onSelectionChange(node.type.name, node.attrs);
          return;
        }

        // Fallback to cursor/mark checks if they clicked inside a Link
        if (editor.isActive('link')) {
          onSelectionChange('link', editor.getAttributes('link'));
          return;
        }

        // None of the above - revert to page settings
        onSelectionChange(null, {});
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[500px]",
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!isMounted) return null;

  return (
    <div className={`w-full h-full bg-white rounded-lg shadow-sm ${className || ""}`}>
      <div className="p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
