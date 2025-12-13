import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { EmailButtonNode } from "./nodes/EmailButtonNode";
import { EmailImageNode } from "./nodes/EmailImageNode";
import { EmailDividerNode } from "./nodes/EmailDividerNode";
import { EmailSpacerNode } from "./nodes/EmailSpacerNode";
import { EmailSectionNode } from "./nodes/EmailSectionNode";

const theme = {
    paragraph: "email-paragraph",
    heading: {
        h1: "email-heading-h1",
        h2: "email-heading-h2",
        h3: "email-heading-h3",
    },
    text: {
        bold: "email-text-bold",
        italic: "email-text-italic",
        underline: "email-text-underline",
    },
    list: {
        ul: "email-list-ul",
        ol: "email-list-ol",
        listitem: "email-list-item",
    },
    link: "email-link",
};

function onError(error: Error) {
    console.error("Lexical error:", error);
}

export function createEditorConfig(
    namespace: string,
    editable: boolean = true,
): InitialConfigType {
    return {
        namespace,
        theme,
        onError,
        editable,
        nodes: [
            HeadingNode,
            QuoteNode,
            ListNode,
            ListItemNode,
            LinkNode,
            AutoLinkNode,
            EmailButtonNode,
            EmailImageNode,
            EmailDividerNode,
            EmailSpacerNode,
            EmailSectionNode,
        ],
    };
}

export { theme };
