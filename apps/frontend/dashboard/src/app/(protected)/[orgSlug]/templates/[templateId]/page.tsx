"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import "./editor.css";

interface Template {
    id: string;
    name: string;
    description: string | null;
    subject: string | null;
    status: "draft" | "published" | "archived";
    content: EmailBlock[];
    createdAt: string;
    updatedAt: string;
}

interface EmailBlock {
    id: string;
    type: "logo" | "heading" | "text" | "button" | "image" | "divider" | "spacer" | "social";
    content?: string;
    props?: Record<string, any>;
}

interface EmailStyles {
    font: string;
    fallbackFont: string;
    paddingX: number;
    paddingY: number;
    bodyColor: string;
    margin: number;
    backgroundColor: string;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
}

const defaultStyles: EmailStyles = {
    font: "Default",
    fallbackFont: "Sans",
    paddingX: 24,
    paddingY: 20,
    bodyColor: "#FFFFFF",
    margin: 48,
    backgroundColor: "#F5F5F4",
    borderRadius: 8,
    borderWidth: 0,
    borderColor: "#000000",
};

const toolbarBlocks = [
    { icon: "image", type: "image", tooltip: "Image" },
    { icon: "code", type: "code", tooltip: "Code" },
    { icon: "type", type: "heading", tooltip: "Heading" },
    { icon: "align-left", type: "text", tooltip: "Text" },
    { icon: "columns", type: "columns", tooltip: "Columns" },
    { icon: "square", type: "button", tooltip: "Button" },
    { icon: "minus", type: "divider", tooltip: "Divider" },
    { icon: "move-vertical", type: "spacer", tooltip: "Spacer" },
];

const fontOptions = ["Default", "Inter", "Roboto", "Open Sans", "Lato", "Montserrat"];
const fallbackFonts = ["Sans", "Serif", "Monospace"];

const TemplateEditorPage = () => {
    const { activeOrganization } = useUserOrganization();
    const params = useParams();
    const templateId = params.templateId as string;

    const { data: template, error, mutate } = useSWR<Template>(
        templateId ? `/api/template/v1/${templateId}` : null,
        { revalidateOnFocus: false },
    );

    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [blocks, setBlocks] = useState<EmailBlock[]>([]);
    const [styles, setStyles] = useState<EmailStyles>(defaultStyles);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<"compose" | "review">("compose");
    const [rightTab, setRightTab] = useState<"styled" | "plain" | "code">("styled");
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    useEffect(() => {
        if (template) {
            setName(template.name);
            setSubject(template.subject || "");
            if (template.content && Array.isArray(template.content)) {
                setBlocks(template.content as EmailBlock[]);
            }
        }
    }, [template]);

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const addBlock = (type: EmailBlock["type"]) => {
        const newBlock: EmailBlock = {
            id: generateId(),
            type,
            content: getDefaultContent(type),
            props: getDefaultProps(type),
        };
        setBlocks([...blocks, newBlock]);
        setHasChanges(true);
        setSelectedBlockId(newBlock.id);
    };

    const getDefaultContent = (type: EmailBlock["type"]): string => {
        switch (type) {
            case "heading": return "Your heading here";
            case "text": return "Your text content here";
            case "button": return "Click here";
            default: return "";
        }
    };

    const getDefaultProps = (type: EmailBlock["type"]): Record<string, any> => {
        switch (type) {
            case "button": return { href: "#", bgColor: "#000000", textColor: "#FFFFFF" };
            case "image": return { src: "", alt: "Image", width: "100%" };
            case "spacer": return { height: 24 };
            case "divider": return { color: "#E5E5E5" };
            case "logo": return { src: "", width: 120 };
            default: return {};
        }
    };

    const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
        setHasChanges(true);
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        setSelectedBlockId(null);
        setHasChanges(true);
    };

    const moveBlock = (id: string, direction: "up" | "down") => {
        const index = blocks.findIndex(b => b.id === id);
        if (direction === "up" && index > 0) {
            const newBlocks = [...blocks];
            const temp = newBlocks[index - 1];
            newBlocks[index - 1] = newBlocks[index] as EmailBlock;
            newBlocks[index] = temp as EmailBlock;
            setBlocks(newBlocks);
        } else if (direction === "down" && index < blocks.length - 1) {
            const newBlocks = [...blocks];
            const temp = newBlocks[index];
            newBlocks[index] = newBlocks[index + 1] as EmailBlock;
            newBlocks[index + 1] = temp as EmailBlock;
            setBlocks(newBlocks);
        }
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/template/v1/${templateId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, subject, content: blocks }),
            });
            setHasChanges(false);
            mutate();
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100dvh-300px)]">
                <Icon name="alert-circle" className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 font-medium text-lg">Template not found</h3>
                <Link
                    href={`/${activeOrganization.slug}/templates`}
                    className={Button.buttonVariants({ variant: "neutral", size: "small" }).root()}
                    style={{ marginTop: "1.5rem" }}
                >
                    Back to templates
                </Link>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-48px)] bg-white">
            {/* Left Sidebar */}
            <div className="w-48 border-r border-gray-200 flex flex-col">
                {/* Template Name */}
                <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Icon name="file-text" className="h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setHasChanges(true); }}
                            className="text-sm font-medium bg-transparent border-none outline-none w-full truncate"
                            placeholder="Untitled"
                        />
                        <Icon name="chevron-down" className="h-3 w-3 text-gray-400" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("compose")}
                        className={`flex-1 py-2 text-xs font-medium ${activeTab === "compose" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500"}`}
                    >
                        Steps
                    </button>
                    <button
                        className="flex-1 py-2 text-xs font-medium text-gray-500"
                    >
                        Components
                    </button>
                </div>

                {/* Steps */}
                <div className="p-2">
                    <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-sm font-medium"
                    >
                        Compose
                    </button>
                    <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Review
                    </button>
                    <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Metrics
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <div className="h-10 border-b border-gray-200 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Sender</span>
                        <span className="text-sm font-medium">Test</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">Editing</span>
                        <div className="h-4 w-px bg-gray-200" />
                        <Button.Root variant="primary" size="xsmall" disabled={!hasChanges} onClick={handleSave}>
                            {isSaving ? <Icon name="loader" className="h-3 w-3 animate-spin" /> : <Icon name="send" className="h-3 w-3" />}
                            Publish
                        </Button.Root>
                    </div>
                </div>

                {/* Subject Line */}
                <div className="px-4 py-2 border-b border-gray-200">
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => { setSubject(e.target.value); setHasChanges(true); }}
                        className="text-sm text-gray-500 bg-transparent border-none outline-none w-full"
                        placeholder="Subject line"
                    />
                </div>

                {/* Toolbar */}
                <div className="h-12 border-b border-gray-200 flex items-center justify-center gap-1 px-4">
                    {toolbarBlocks.map((block) => (
                        <button
                            key={block.type}
                            onClick={() => addBlock(block.type as EmailBlock["type"])}
                            className="p-2 rounded hover:bg-gray-100 transition-colors group relative"
                            title={block.tooltip}
                        >
                            <Icon name={block.icon as any} className="h-4 w-4 text-gray-600" />
                        </button>
                    ))}
                    <div className="w-px h-5 bg-gray-200 mx-2" />
                    <button className="p-2 rounded hover:bg-gray-100" title="Undo">
                        <Icon name="undo" className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-2 rounded hover:bg-gray-100" title="Redo">
                        <Icon name="redo" className="h-4 w-4 text-gray-600" />
                    </button>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-y-auto" style={{ backgroundColor: styles.backgroundColor }}>
                    <div className="py-8 px-4">
                        <div
                            className="mx-auto max-w-[600px] bg-white shadow-sm"
                            style={{
                                borderRadius: styles.borderRadius,
                                border: styles.borderWidth > 0 ? `${styles.borderWidth}px solid ${styles.borderColor}` : "none",
                                padding: `${styles.paddingY}px ${styles.paddingX}px`,
                            }}
                        >
                            {blocks.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                                        <Icon name="plus" className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-500">Click a block above to add content</p>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {blocks.map((block) => (
                                        <div
                                            key={block.id}
                                            onClick={() => setSelectedBlockId(block.id)}
                                            className={`relative group cursor-pointer transition-all ${selectedBlockId === block.id ? "ring-2 ring-blue-500 ring-offset-2" : "hover:ring-1 hover:ring-gray-300"
                                                }`}
                                        >
                                            {/* Block Controls */}
                                            <div className={`absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 ${selectedBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                                <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }} className="p-1 rounded bg-white shadow-sm hover:bg-gray-50">
                                                    <Icon name="chevron-up" className="h-3 w-3" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }} className="p-1 rounded bg-white shadow-sm hover:bg-gray-50">
                                                    <Icon name="chevron-down" className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className={`absolute -right-8 top-1/2 -translate-y-1/2 ${selectedBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                                <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1 rounded bg-white shadow-sm hover:bg-red-50 hover:text-red-500">
                                                    <Icon name="trash-2" className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Block Content */}
                                            <BlockRenderer
                                                block={block}
                                                onUpdate={(updates) => updateBlock(block.id, updates)}
                                                isSelected={selectedBlockId === block.id}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Styles */}
            <div className="w-64 border-l border-gray-200 flex flex-col">
                {/* Tabs */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <div className="flex gap-2">
                        {(["styled", "plain", "code"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setRightTab(tab)}
                                className={`text-xs font-medium capitalize ${rightTab === tab ? "text-gray-900" : "text-gray-500"}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-gray-400">EN</span>
                </div>

                {/* Styles Content */}
                <div className="flex-1 overflow-y-auto p-3">
                    {rightTab === "styled" && (
                        <div className="space-y-5">
                            {/* Theme */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Theme</span>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Icon name="plus" className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Email Styles */}
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email styles</span>
                                <div className="mt-3 space-y-3">
                                    <StyleRow label="Font">
                                        <select
                                            value={styles.font}
                                            onChange={(e) => setStyles({ ...styles, font: e.target.value })}
                                            className="text-xs bg-transparent border-none outline-none text-right"
                                        >
                                            {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </StyleRow>
                                    <StyleRow label="Fallback">
                                        <select
                                            value={styles.fallbackFont}
                                            onChange={(e) => setStyles({ ...styles, fallbackFont: e.target.value })}
                                            className="text-xs bg-transparent border-none outline-none text-right"
                                        >
                                            {fallbackFonts.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </StyleRow>
                                    <StyleRow label="Padding">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">↔</span>
                                            <input type="number" value={styles.paddingX} onChange={(e) => setStyles({ ...styles, paddingX: Number(e.target.value) })} className="w-10 text-xs text-right bg-transparent border-none outline-none" />
                                            <span className="text-[10px] text-gray-400">↕</span>
                                            <input type="number" value={styles.paddingY} onChange={(e) => setStyles({ ...styles, paddingY: Number(e.target.value) })} className="w-10 text-xs text-right bg-transparent border-none outline-none" />
                                        </div>
                                    </StyleRow>
                                    <StyleRow label="Body">
                                        <ColorInput value={styles.bodyColor} onChange={(v) => setStyles({ ...styles, bodyColor: v })} />
                                    </StyleRow>
                                    <StyleRow label="Margin">
                                        <input type="number" value={styles.margin} onChange={(e) => setStyles({ ...styles, margin: Number(e.target.value) })} className="w-12 text-xs text-right bg-transparent border-none outline-none" />
                                    </StyleRow>
                                    <StyleRow label="Background">
                                        <ColorInput value={styles.backgroundColor} onChange={(v) => setStyles({ ...styles, backgroundColor: v })} />
                                    </StyleRow>
                                    <StyleRow label="Radius">
                                        <input type="number" value={styles.borderRadius} onChange={(e) => setStyles({ ...styles, borderRadius: Number(e.target.value) })} className="w-12 text-xs text-right bg-transparent border-none outline-none" />
                                    </StyleRow>
                                    <StyleRow label="Border width">
                                        <input type="number" value={styles.borderWidth} onChange={(e) => setStyles({ ...styles, borderWidth: Number(e.target.value) })} className="w-12 text-xs text-right bg-transparent border-none outline-none" />
                                    </StyleRow>
                                    <StyleRow label="Border color">
                                        <ColorInput value={styles.borderColor} onChange={(v) => setStyles({ ...styles, borderColor: v })} />
                                    </StyleRow>
                                </div>
                            </div>

                            {/* Selected Block Properties */}
                            {selectedBlock && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {selectedBlock.type} settings
                                    </span>
                                    <div className="mt-3 space-y-3">
                                        <BlockProperties block={selectedBlock} onUpdate={(updates) => updateBlock(selectedBlock.id, updates)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {rightTab === "plain" && (
                        <div className="text-sm text-gray-500 text-center py-8">Plain text version</div>
                    )}
                    {rightTab === "code" && (
                        <div className="text-sm text-gray-500 text-center py-8">HTML code view</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StyleRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{label}</span>
        {children}
    </div>
);

const ColorInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-1.5">
        <div
            className="h-4 w-4 rounded border border-gray-300"
            style={{ backgroundColor: value }}
        />
        <input
            type="text"
            value={value.replace("#", "")}
            onChange={(e) => onChange(e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`)}
            className="w-14 text-xs bg-transparent border-none outline-none font-mono"
        />
    </div>
);

const BlockRenderer = ({ block, onUpdate, isSelected }: { block: EmailBlock; onUpdate: (updates: Partial<EmailBlock>) => void; isSelected: boolean }) => {
    switch (block.type) {
        case "heading":
            return (
                <h1
                    contentEditable={isSelected}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdate({ content: e.currentTarget.textContent || "" })}
                    className="text-2xl font-bold text-center py-4 outline-none"
                >
                    {block.content}
                </h1>
            );
        case "text":
            return (
                <p
                    contentEditable={isSelected}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdate({ content: e.currentTarget.textContent || "" })}
                    className="text-sm text-gray-600 text-center py-2 outline-none"
                >
                    {block.content}
                </p>
            );
        case "button":
            return (
                <div className="py-4 text-center">
                    <a
                        href={block.props?.href || "#"}
                        className="inline-block px-6 py-2.5 rounded text-sm font-medium"
                        style={{
                            backgroundColor: block.props?.bgColor || "#000",
                            color: block.props?.textColor || "#fff",
                        }}
                    >
                        {block.content}
                    </a>
                </div>
            );
        case "image":
            return (
                <div className="py-4">
                    {block.props?.src ? (
                        <img src={block.props.src} alt={block.props.alt || ""} className="max-w-full mx-auto" style={{ width: block.props.width }} />
                    ) : (
                        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                            <Icon name="image" className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                </div>
            );
        case "divider":
            return <hr className="my-4" style={{ borderColor: block.props?.color || "#E5E5E5" }} />;
        case "spacer":
            return <div style={{ height: block.props?.height || 24 }} />;
        case "logo":
            return (
                <div className="py-4 text-center">
                    {block.props?.src ? (
                        <img src={block.props.src} alt="Logo" style={{ width: block.props.width || 120 }} className="mx-auto" />
                    ) : (
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded bg-gray-100">
                            <span className="text-xl">∞</span>
                        </div>
                    )}
                </div>
            );
        default:
            return <div className="py-4 text-center text-gray-400">Unknown block</div>;
    }
};

const BlockProperties = ({ block, onUpdate }: { block: EmailBlock; onUpdate: (updates: Partial<EmailBlock>) => void }) => {
    switch (block.type) {
        case "heading":
        case "text":
            return (
                <>
                    <StyleRow label="Text">
                        <input
                            type="text"
                            value={block.content || ""}
                            onChange={(e) => onUpdate({ content: e.target.value })}
                            className="w-32 text-xs text-right bg-transparent border-none outline-none"
                        />
                    </StyleRow>
                </>
            );
        case "button":
            return (
                <>
                    <StyleRow label="Label">
                        <input
                            type="text"
                            value={block.content || ""}
                            onChange={(e) => onUpdate({ content: e.target.value })}
                            className="w-24 text-xs text-right bg-transparent border-none outline-none"
                        />
                    </StyleRow>
                    <StyleRow label="URL">
                        <input
                            type="text"
                            value={block.props?.href || ""}
                            onChange={(e) => onUpdate({ props: { ...block.props, href: e.target.value } })}
                            className="w-24 text-xs text-right bg-transparent border-none outline-none"
                        />
                    </StyleRow>
                    <StyleRow label="Background">
                        <ColorInput
                            value={block.props?.bgColor || "#000000"}
                            onChange={(v) => onUpdate({ props: { ...block.props, bgColor: v } })}
                        />
                    </StyleRow>
                    <StyleRow label="Text color">
                        <ColorInput
                            value={block.props?.textColor || "#FFFFFF"}
                            onChange={(v) => onUpdate({ props: { ...block.props, textColor: v } })}
                        />
                    </StyleRow>
                </>
            );
        case "image":
            return (
                <>
                    <StyleRow label="URL">
                        <input
                            type="text"
                            value={block.props?.src || ""}
                            onChange={(e) => onUpdate({ props: { ...block.props, src: e.target.value } })}
                            className="w-24 text-xs text-right bg-transparent border-none outline-none"
                            placeholder="https://..."
                        />
                    </StyleRow>
                    <StyleRow label="Alt text">
                        <input
                            type="text"
                            value={block.props?.alt || ""}
                            onChange={(e) => onUpdate({ props: { ...block.props, alt: e.target.value } })}
                            className="w-24 text-xs text-right bg-transparent border-none outline-none"
                        />
                    </StyleRow>
                </>
            );
        case "spacer":
            return (
                <StyleRow label="Height">
                    <input
                        type="number"
                        value={block.props?.height || 24}
                        onChange={(e) => onUpdate({ props: { ...block.props, height: Number(e.target.value) } })}
                        className="w-12 text-xs text-right bg-transparent border-none outline-none"
                    />
                </StyleRow>
            );
        case "divider":
            return (
                <StyleRow label="Color">
                    <ColorInput
                        value={block.props?.color || "#E5E5E5"}
                        onChange={(v) => onUpdate({ props: { ...block.props, color: v } })}
                    />
                </StyleRow>
            );
        default:
            return null;
    }
};

export default TemplateEditorPage;
