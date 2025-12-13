import type { ReactNode } from "react";
import {
    DecoratorNode,
    type DOMExportOutput,
    type LexicalNode,
    type NodeKey,
    type SerializedLexicalNode,
    type Spread,
} from "lexical";

export type SerializedEmailImageNode = Spread<
    {
        src: string;
        alt: string;
        width: string;
    },
    SerializedLexicalNode
>;

export class EmailImageNode extends DecoratorNode<ReactNode> {
    __src: string;
    __alt: string;
    __width: string;

    static getType(): string {
        return "email-image";
    }

    static clone(node: EmailImageNode): EmailImageNode {
        return new EmailImageNode(node.__src, node.__alt, node.__width, node.__key);
    }

    constructor(
        src: string = "",
        alt: string = "",
        width: string = "100%",
        key?: NodeKey,
    ) {
        super(key);
        this.__src = src;
        this.__alt = alt;
        this.__width = width;
    }

    createDOM(): HTMLElement {
        const dom = document.createElement("div");
        dom.className = "email-image-container";
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("img");
        element.src = this.__src;
        element.alt = this.__alt;
        element.style.width = this.__width;
        element.style.maxWidth = "100%";
        element.style.height = "auto";
        element.style.display = "block";
        return { element };
    }

    static importJSON(serializedNode: SerializedEmailImageNode): EmailImageNode {
        return new EmailImageNode(
            serializedNode.src,
            serializedNode.alt,
            serializedNode.width,
        );
    }

    exportJSON(): SerializedEmailImageNode {
        return {
            type: "email-image",
            version: 1,
            src: this.__src,
            alt: this.__alt,
            width: this.__width,
        };
    }

    setSrc(src: string): void {
        const writable = this.getWritable();
        writable.__src = src;
    }

    setAlt(alt: string): void {
        const writable = this.getWritable();
        writable.__alt = alt;
    }

    setWidth(width: string): void {
        const writable = this.getWritable();
        writable.__width = width;
    }

    getSrc(): string {
        return this.__src;
    }

    decorate(): ReactNode {
        return (
            <div className="my-2">
                {this.__src ? (
                    <img
                        src={this.__src}
                        alt={this.__alt}
                        style={{ width: this.__width, maxWidth: "100%" }}
                        className="mx-auto block rounded"
                    />
                ) : (
                    <div className="mx-auto flex h-32 w-full items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50">
                        <span className="text-gray-400">Click to add image</span>
                    </div>
                )}
            </div>
        );
    }
}

export function $createEmailImageNode(
    src?: string,
    alt?: string,
    width?: string,
): EmailImageNode {
    return new EmailImageNode(src, alt, width);
}

export function $isEmailImageNode(
    node: LexicalNode | null | undefined,
): node is EmailImageNode {
    return node instanceof EmailImageNode;
}
