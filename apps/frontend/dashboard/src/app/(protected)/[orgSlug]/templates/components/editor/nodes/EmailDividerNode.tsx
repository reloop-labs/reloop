import type { ReactNode } from "react";
import {
    DecoratorNode,
    type DOMExportOutput,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from "lexical";

export type SerializedEmailDividerNode = Spread<
    {
        color: string;
        thickness: number;
    },
    SerializedLexicalNode
>;

export class EmailDividerNode extends DecoratorNode<ReactNode> {
    __color: string;
    __thickness: number;

    static getType(): string {
        return "email-divider";
    }

    static clone(node: EmailDividerNode): EmailDividerNode {
        return new EmailDividerNode(node.__color, node.__thickness, node.__key);
    }

    constructor(
        color: string = "#e5e7eb",
        thickness: number = 1,
        key?: NodeKey,
    ) {
        super(key);
        this.__color = color;
        this.__thickness = thickness;
    }

    createDOM(): HTMLElement {
        const dom = document.createElement("div");
        dom.className = "email-divider-container";
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("hr");
        element.style.border = "none";
        element.style.borderTop = `${this.__thickness}px solid ${this.__color}`;
        element.style.margin = "16px 0";
        return { element };
    }

    static importJSON(serializedNode: SerializedEmailDividerNode): EmailDividerNode {
        return new EmailDividerNode(
            serializedNode.color,
            serializedNode.thickness,
        );
    }

    exportJSON(): SerializedEmailDividerNode {
        return {
            type: "email-divider",
            version: 1,
            color: this.__color,
            thickness: this.__thickness,
        };
    }

    setColor(color: string): void {
        const writable = this.getWritable();
        writable.__color = color;
    }

    setThickness(thickness: number): void {
        const writable = this.getWritable();
        writable.__thickness = thickness;
    }

    decorate(): ReactNode {
        return (
            <div className="my-4">
                <hr
                    style={{
                        border: "none",
                        borderTop: `${this.__thickness}px solid ${this.__color}`,
                    }}
                />
            </div>
        );
    }
}

export function $createEmailDividerNode(
    color?: string,
    thickness?: number,
): EmailDividerNode {
    return new EmailDividerNode(color, thickness);
}

export function $isEmailDividerNode(
    node: LexicalNode | null | undefined,
): node is EmailDividerNode {
    return node instanceof EmailDividerNode;
}
