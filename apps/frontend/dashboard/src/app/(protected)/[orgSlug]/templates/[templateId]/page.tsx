"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { EmailEditor } from "../components/editor";
import "./editor.css";

interface Template {
    id: string;
    name: string;
    description: string | null;
    subject: string | null;
    status: "draft" | "published" | "archived";
    content: unknown[];
    createdAt: string;
    updatedAt: string;
}

const blocks = [
    { icon: "type", name: "Heading", type: "heading" },
    { icon: "align-left", name: "Text", type: "text" },
    { icon: "square", name: "Button", type: "button" },
    { icon: "image", name: "Image", type: "image" },
    { icon: "minus", name: "Divider", type: "divider" },
    { icon: "move-vertical", name: "Spacer", type: "spacer" },
];

const TemplateEditorPage = () => {
    const { activeOrganization } = useUserOrganization();
    const params = useParams();
    const router = useRouter();
    const templateId = params.templateId as string;

    const { data: template, error, mutate } = useSWR<Template>(
        templateId ? `/api/template/v1/${templateId}` : null,
        {
            revalidateOnFocus: false,
        },
    );

    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (template) {
            setName(template.name);
            setSubject(template.subject || "");
            if (template.content && Array.isArray(template.content)) {
                setContent(JSON.stringify(template.content));
            }
        }
    }, [template]);

    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent);
        setHasChanges(true);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/template/v1/${templateId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    subject: subject || undefined,
                    content: content ? JSON.parse(content) : [],
                }),
            });
            setHasChanges(false);
            mutate();
        } catch (error) {
            console.error("Failed to save template:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            await fetch(`/api/template/v1/${templateId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: "published" }),
            });
            mutate();
        } catch (error) {
            console.error("Failed to publish template:", error);
        } finally {
            setIsPublishing(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Icon name="alert-circle" className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 font-medium text-lg">Template not found</h3>
                <Link
                    href={`/${activeOrganization.slug}/templates`}
                    className={Button.buttonVariants({
                        variant: "neutral",
                        size: "small",
                    }).root()}
                    style={{ marginTop: "1rem" }}
                >
                    Back to templates
                </Link>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex items-center justify-center py-16">
                <Icon name="loader" className="h-8 w-8 animate-spin text-text-sub-600" />
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Editor Header */}
            <div className="sticky top-12 z-10 flex items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${activeOrganization.slug}/templates`}
                        className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-bg-weak-50 transition-colors"
                    >
                        <Icon name="arrow-left" className="h-4 w-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Input.Root size="small" className="w-64">
                            <Input.Wrapper>
                                <Input.Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setHasChanges(true);
                                    }}
                                    className="font-medium"
                                />
                            </Input.Wrapper>
                        </Input.Root>
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${template.status === "published"
                                    ? "bg-green-100 text-green-700"
                                    : template.status === "archived"
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-amber-100 text-amber-700"
                                }`}
                        >
                            {template.status}
                        </span>
                        {hasChanges && (
                            <span className="text-xs text-amber-600">Unsaved changes</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button.Root
                        variant="neutral"
                        mode="stroke"
                        size="xsmall"
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                    >
                        {isSaving ? (
                            <Icon name="loader" className="h-4 w-4 animate-spin" />
                        ) : (
                            <Icon name="save" className="h-4 w-4" />
                        )}
                        Save
                    </Button.Root>
                    {template.status !== "published" && (
                        <Button.Root
                            variant="primary"
                            size="xsmall"
                            onClick={handlePublish}
                            disabled={isPublishing}
                        >
                            {isPublishing ? (
                                <Icon name="loader" className="h-4 w-4 animate-spin" />
                            ) : (
                                <Icon name="send" className="h-4 w-4" />
                            )}
                            Publish
                        </Button.Root>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex h-[calc(100vh-160px)]">
                {/* Block Palette - Left Sidebar */}
                <div className="w-64 border-r border-stroke-soft-200 bg-bg-weak-50/50 p-4 overflow-y-auto">
                    <h3 className="font-medium text-sm mb-4">Blocks</h3>
                    <div className="space-y-2">
                        {blocks.map((block) => (
                            <div
                                key={block.type}
                                className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 cursor-grab hover:border-primary-base hover:shadow-sm transition-all active:cursor-grabbing"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("blockType", block.type);
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-bg-weak-50">
                                    <Icon name={block.icon as any} className="h-4 w-4" />
                                </div>
                                <span className="text-sm">{block.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-stroke-soft-200">
                        <h3 className="font-medium text-sm mb-2">Tips</h3>
                        <ul className="text-xs text-text-sub-600 space-y-1">
                            <li>• Drag blocks to the canvas</li>
                            <li>• Use toolbar for text formatting</li>
                            <li>• {"{{variable}}"} for dynamic content</li>
                        </ul>
                    </div>
                </div>

                {/* Canvas - Center */}
                <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
                    <div className="mx-auto max-w-2xl">
                        <EmailEditor
                            templateId={templateId}
                            initialContent={content}
                            onContentChange={handleContentChange}
                        />
                    </div>
                </div>

                {/* Properties Panel - Right Sidebar */}
                <div className="w-72 border-l border-stroke-soft-200 bg-bg-white-0 p-4 overflow-y-auto">
                    <h3 className="font-medium text-sm mb-4">Properties</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-text-sub-600 mb-1.5">
                                Subject Line
                            </label>
                            <Input.Root size="small">
                                <Input.Wrapper>
                                    <Input.Input
                                        type="text"
                                        placeholder="Email subject..."
                                        value={subject}
                                        onChange={(e) => {
                                            setSubject(e.target.value);
                                            setHasChanges(true);
                                        }}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>
                        <div className="pt-4 border-t border-stroke-soft-200">
                            <h4 className="text-xs font-medium mb-2">Variables</h4>
                            <div className="space-y-1">
                                {["{{firstName}}", "{{lastName}}", "{{email}}", "{{companyName}}"].map((variable) => (
                                    <div
                                        key={variable}
                                        className="text-xs px-2 py-1 rounded bg-bg-weak-50 text-text-sub-600 cursor-pointer hover:bg-bg-soft-200 transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(variable);
                                        }}
                                    >
                                        {variable}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-text-sub-500">
                                Click to copy variable
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateEditorPage;
