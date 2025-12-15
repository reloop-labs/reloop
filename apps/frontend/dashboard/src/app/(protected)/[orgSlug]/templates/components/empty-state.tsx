"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Spinner from "@reloop/ui/spinner";

interface EmptyStateProps {
    orgSlug: string;
}

export const EmptyState = ({ orgSlug }: EmptyStateProps) => {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateTemplate = async () => {
        setIsCreating(true);
        try {
            const response = await fetch("/api/template/v1/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: "Untitled",
                    content: [],
                }),
            });

            if (response.ok) {
                const template = await response.json();
                router.push(`/${orgSlug}/templates/${template.id}`);
            }
        } catch (error) {
            console.error("Failed to create template:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-weak-50">
                <Icon name="file-text" className="h-8 w-8 text-text-sub-600" />
            </div>
            <h3 className="mt-4 font-medium text-lg">No templates yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-text-sub-600">
                Create your first email template to start building reusable email designs with our drag-and-drop editor.
            </p>
            <Button.Root
                variant="primary"
                size="small"
                onClick={handleCreateTemplate}
                disabled={isCreating}
                style={{ marginTop: "1.5rem" }}
            >
                {isCreating ? (
                    <Spinner size={16} />
                ) : (
                    <Icon name="plus" className="h-4 w-4" />
                )}
                {isCreating ? "Creating..." : "Create your first template"}
            </Button.Root>
        </div>
    );
};
