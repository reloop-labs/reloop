"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

interface EmptyStateProps {
    orgSlug: string;
}

export const EmptyState = ({ orgSlug }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-weak-50">
                <Icon name="file-text" className="h-8 w-8 text-text-sub-600" />
            </div>
            <h3 className="mt-4 font-medium text-lg">No templates yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-text-sub-600">
                Create your first email template to start building reusable email designs with our drag-and-drop editor.
            </p>
            <Link
                href={`/${orgSlug}/templates/create`}
                className={Button.buttonVariants({
                    variant: "primary",
                    size: "small",
                }).root()}
                style={{ marginTop: "1.5rem" }}
            >
                <Icon name="plus" className="h-4 w-4" />
                Create your first template
            </Link>
        </div>
    );
};
