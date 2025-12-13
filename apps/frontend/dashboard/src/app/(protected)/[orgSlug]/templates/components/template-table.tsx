"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Dropdown from "@reloop/ui/dropdown";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(relativeTime);

interface Template {
    id: string;
    name: string;
    description: string | null;
    subject: string | null;
    status: "draft" | "published" | "archived";
    createdAt: string;
    updatedAt: string;
}

interface TemplateTableProps {
    templates: Template[];
    activeOrganizationSlug: string;
    isLoading: boolean;
    loadingRows?: number;
    onMutate: () => void;
}

const statusColors = {
    draft: "bg-amber-100 text-amber-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-600",
};

export const TemplateTable = ({
    templates,
    activeOrganizationSlug,
    isLoading,
    loadingRows = 4,
    onMutate,
}: TemplateTableProps) => {
    const handleDuplicate = async (id: string) => {
        try {
            await fetch(`/api/template/v1/${id}/duplicate`, {
                method: "POST",
                credentials: "include",
            });
            onMutate();
        } catch (error) {
            console.error("Failed to duplicate template:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            await fetch(`/api/template/v1/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            onMutate();
        } catch (error) {
            console.error("Failed to delete template:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: loadingRows }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 animate-pulse rounded-xl bg-bg-weak-50"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {templates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={`/${activeOrganizationSlug}/templates/${template.id}`}
                            className="group flex items-center justify-between rounded-xl border border-stroke-soft-200 p-4 transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600">
                                        <Icon name="file-text" className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">
                                            {template.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[template.status]}`}
                                            >
                                                {template.status}
                                            </span>
                                            <span className="text-xs text-text-sub-600">
                                                Updated {dayjs(template.updatedAt).fromNow()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                                <Dropdown.Root>
                                    <Dropdown.Trigger asChild>
                                        <Button.Root
                                            variant="neutral"
                                            mode="ghost"
                                            size="xxsmall"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Icon name="more-horizontal" className="h-4 w-4" />
                                        </Button.Root>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="end">
                                        <Dropdown.Item onClick={() => handleDuplicate(template.id)}>
                                            <Icon name="copy" className="h-4 w-4" />
                                            Duplicate
                                        </Dropdown.Item>
                                        <Dropdown.Separator />
                                        <Dropdown.Item
                                            onClick={() => handleDelete(template.id)}
                                            className="text-red-600"
                                        >
                                            <Icon name="trash" className="h-4 w-4" />
                                            Delete
                                        </Dropdown.Item>
                                    </Dropdown.Content>
                                </Dropdown.Root>
                                <Icon
                                    name="chevron-right"
                                    className="h-4 w-4 text-text-sub-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
