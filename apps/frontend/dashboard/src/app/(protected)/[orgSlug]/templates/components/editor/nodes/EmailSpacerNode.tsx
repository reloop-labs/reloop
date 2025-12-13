import type { ReactNode } from "react";
import {
    DecoratorNode,
    type DOMExportOutput,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from "lexical";

export type SerializedEmailSpacerNode = Spread<
    {
        height: number;
    },
    SerializedLexicalNode
>;

export class EmailSpacerNode extends DecoratorNode<ReactNode> {
    __height: number;

    static getType(): string {
        return "email-spacer";
    }

    static clone(node: EmailSpacerNode): EmailSpacerNode {
        return new EmailSpacerNode(node.__height, node.__key);
    }

    constructor(height: number = 24, key?: NodeKey) {
        super(key);
        this.__height = height;
    }

    createDOM(): HTMLElement {
        const dom = document.createElement("div");
        dom.className = "email-spacer-container";
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("div");
        element.style.height = `${this.__height}px`;
        element.style.lineHeight = `${this.__height}px`;
        element.innerHTML = "&nbsp;";
        return { element };
    }

    static importJSON(serializedNode: SerializedEmailSpacerNode): EmailSpacerNode {
        return new EmailSpacerNode(serializedNode.height);
    }

    exportJSON(): SerializedEmailSpacerNode {
        return {
            type: "email-spacer",
            version: 1,
            height: this.__height,
        };
    }

    setHeight(height: number): void {
        const writable = this.getWritable();
        writable.__height = height;
    }

    getHeight(): number {
        return this.__height;
    }

    decorate(): ReactNode {
        return (
            <div
                className="email-spacer bg-gray-50 border border-dashed border-gray-200 rounded relative group"
                style={{ height: `${this.__height}px` }}
            >
                <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {this.__height}px
                </span>
            </div>
        );
    }
}

export function $createEmailSpacerNode(height?: number): EmailSpacerNode {
    return new EmailSpacerNode(height);
}

export function $isEmailSpacerNode(
    node: LexicalNode | null | undefined,
): node is EmailSpacerNode {
    return node instanceof EmailSpacerNode;
}
