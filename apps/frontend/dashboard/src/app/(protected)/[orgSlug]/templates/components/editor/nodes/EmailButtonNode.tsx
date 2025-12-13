import type { ReactNode } from "react";
import {
    DecoratorNode,
    type DOMConversionMap,
    type DOMExportOutput,
    type EditorConfig,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from "lexical";

export type SerializedEmailButtonNode = Spread<
    {
        text: string;
        href: string;
        backgroundColor: string;
        textColor: string;
    },
    SerializedLexicalNode
>;

export class EmailButtonNode extends DecoratorNode<ReactNode> {
    __text: string;
    __href: string;
    __backgroundColor: string;
    __textColor: string;

    static getType(): string {
        return "email-button";
    }

    static clone(node: EmailButtonNode): EmailButtonNode {
        return new EmailButtonNode(
            node.__text,
            node.__href,
            node.__backgroundColor,
            node.__textColor,
            node.__key,
        );
    }

    constructor(
        text: string = "Click here",
        href: string = "#",
        backgroundColor: string = "#3b82f6",
        textColor: string = "#ffffff",
        key?: NodeKey,
    ) {
        super(key);
        this.__text = text;
        this.__href = href;
        this.__backgroundColor = backgroundColor;
        this.__textColor = textColor;
    }

    createDOM(): HTMLElement {
        const dom = document.createElement("div");
        dom.className = "email-button-container";
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("a");
        element.href = this.__href;
        element.textContent = this.__text;
        element.style.display = "inline-block";
        element.style.padding = "12px 24px";
        element.style.backgroundColor = this.__backgroundColor;
        element.style.color = this.__textColor;
        element.style.textDecoration = "none";
        element.style.borderRadius = "6px";
        element.style.fontWeight = "600";
        return { element };
    }

    static importJSON(serializedNode: SerializedEmailButtonNode): EmailButtonNode {
        return new EmailButtonNode(
            serializedNode.text,
            serializedNode.href,
            serializedNode.backgroundColor,
            serializedNode.textColor,
        );
    }

    exportJSON(): SerializedEmailButtonNode {
        return {
            type: "email-button",
            version: 1,
            text: this.__text,
            href: this.__href,
            backgroundColor: this.__backgroundColor,
            textColor: this.__textColor,
        };
    }

    setText(text: string): void {
        const writable = this.getWritable();
        writable.__text = text;
    }

    setHref(href: string): void {
        const writable = this.getWritable();
        writable.__href = href;
    }

    setBackgroundColor(color: string): void {
        const writable = this.getWritable();
        writable.__backgroundColor = color;
    }

    setTextColor(color: string): void {
        const writable = this.getWritable();
        writable.__textColor = color;
    }

    getText(): string {
        return this.__text;
    }

    getHref(): string {
        return this.__href;
    }

    decorate(): ReactNode {
        return (
            <div className="my-2 text-center">
                <a
                    href={this.__href}
                    className="inline-block rounded-md px-6 py-3 font-semibold no-underline"
                    style={{
                        backgroundColor: this.__backgroundColor,
                        color: this.__textColor,
                    }}
                >
                    {this.__text}
                </a>
            </div>
        );
    }
}

export function $createEmailButtonNode(
    text?: string,
    href?: string,
    backgroundColor?: string,
    textColor?: string,
): EmailButtonNode {
    return new EmailButtonNode(text, href, backgroundColor, textColor);
}

export function $isEmailButtonNode(
    node: LexicalNode | null | undefined,
): node is EmailButtonNode {
    return node instanceof EmailButtonNode;
}
