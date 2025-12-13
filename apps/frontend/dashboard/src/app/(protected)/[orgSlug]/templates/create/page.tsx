"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CreateTemplatePage = () => {
    const { activeOrganization } = useUserOrganization();
    const router = useRouter();
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;

        setIsCreating(true);
        try {
            const response = await fetch("/api/template/v1/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: name.trim(),
                    subject: subject.trim() || undefined,
                    description: description.trim() || undefined,
                    content: [],
                }),
            });

            if (response.ok) {
                const template = await response.json();
                router.push(`/${activeOrganization.slug}/templates/${template.id}`);
            }
        } catch (error) {
            console.error("Failed to create template:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl sm:px-8 py-10">
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href={`/${activeOrganization.slug}/templates`}
                    className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-bg-weak-50 transition-colors"
                >
                    <Icon name="arrow-left" className="h-4 w-4" />
                </Link>
                <h1 className="font-medium text-xl">Create Template</h1>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Template Name <span className="text-red-500">*</span>
                    </label>
                    <Input.Root size="medium">
                        <Input.Wrapper>
                            <Input.Input
                                type="text"
                                placeholder="e.g., Welcome Email"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Input.Wrapper>
                    </Input.Root>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Subject Line
                    </label>
                    <Input.Root size="medium">
                        <Input.Wrapper>
                            <Input.Input
                                type="text"
                                placeholder="e.g., Welcome to {{companyName}}"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </Input.Wrapper>
                    </Input.Root>
                    <p className="mt-1 text-xs text-text-sub-600">
                        Use {"{{variable}}"} syntax for dynamic content
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <Input.Root size="medium">
                        <Input.Wrapper>
                            <Input.Input
                                type="text"
                                placeholder="Brief description of this template"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Input.Wrapper>
                    </Input.Root>
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <Button.Root
                        variant="primary"
                        size="medium"
                        onClick={handleCreate}
                        disabled={!name.trim() || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Icon name="loader" className="h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Icon name="plus" className="h-4 w-4" />
                                Create Template
                            </>
                        )}
                    </Button.Root>
                    <Link
                        href={`/${activeOrganization.slug}/templates`}
                        className={Button.buttonVariants({
                            variant: "neutral",
                            mode: "stroke",
                            size: "medium",
                        }).root()}
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CreateTemplatePage;
