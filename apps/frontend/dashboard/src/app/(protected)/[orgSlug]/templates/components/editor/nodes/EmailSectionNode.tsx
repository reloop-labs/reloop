import {
    ElementNode,
    type DOMExportOutput,
    type LexicalNode,
    type NodeKey,
    type SerializedElementNode,
    type Spread,
} from "lexical";

export type SerializedEmailSectionNode = Spread<
    {
        backgroundColor: string;
        padding: string;
    },
    SerializedElementNode
>;

export class EmailSectionNode extends ElementNode {
    __backgroundColor: string;
    __padding: string;

    static getType(): string {
        return "email-section";
    }

    static clone(node: EmailSectionNode): EmailSectionNode {
        return new EmailSectionNode(
            node.__backgroundColor,
            node.__padding,
            node.__key,
        );
    }

    constructor(
        backgroundColor: string = "#ffffff",
        padding: string = "20px",
        key?: NodeKey,
    ) {
        super(key);
        this.__backgroundColor = backgroundColor;
        this.__padding = padding;
    }

    createDOM(): HTMLElement {
        const dom = document.createElement("div");
        dom.className = "email-section";
        dom.style.backgroundColor = this.__backgroundColor;
        dom.style.padding = this.__padding;
        dom.style.borderRadius = "8px";
        dom.style.marginBottom = "16px";
        return dom;
    }

    updateDOM(prevNode: EmailSectionNode, dom: HTMLElement): boolean {
        if (prevNode.__backgroundColor !== this.__backgroundColor) {
            dom.style.backgroundColor = this.__backgroundColor;
        }
        if (prevNode.__padding !== this.__padding) {
            dom.style.padding = this.__padding;
        }
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("div");
        element.style.backgroundColor = this.__backgroundColor;
        element.style.padding = this.__padding;
        return { element };
    }

    static importJSON(serializedNode: SerializedEmailSectionNode): EmailSectionNode {
        return new EmailSectionNode(
            serializedNode.backgroundColor,
            serializedNode.padding,
        );
    }

    exportJSON(): SerializedEmailSectionNode {
        return {
            ...super.exportJSON(),
            type: "email-section",
            version: 1,
            backgroundColor: this.__backgroundColor,
            padding: this.__padding,
        };
    }

    setBackgroundColor(color: string): void {
        const writable = this.getWritable();
        writable.__backgroundColor = color;
    }

    setPadding(padding: string): void {
        const writable = this.getWritable();
        writable.__padding = padding;
    }
}

export function $createEmailSectionNode(
    backgroundColor?: string,
    padding?: string,
): EmailSectionNode {
    return new EmailSectionNode(backgroundColor, padding);
}

export function $isEmailSectionNode(
    node: LexicalNode | null | undefined,
): node is EmailSectionNode {
    return node instanceof EmailSectionNode;
}
