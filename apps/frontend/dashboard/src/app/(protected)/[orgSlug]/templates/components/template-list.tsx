"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import useSWR from "swr";
import { TemplateTable } from "./template-table";
import { EmptyState } from "./empty-state";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import Spinner from "@reloop/ui/spinner";

interface Template {
    id: string;
    name: string;
    description: string | null;
    subject: string | null;
    status: "draft" | "published" | "archived";
    createdAt: string;
    updatedAt: string;
}

interface TemplateListResponse {
    templates: Template[];
    total: number;
    page: number;
    limit: number;
}

export const TemplateList = () => {
    const { activeOrganization } = useUserOrganization();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isCreating, setIsCreating] = useState(false);
    const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

    const { data, error, isLoading, mutate } = useSWR<TemplateListResponse>(
        activeOrganization?.id
            ? `/api/template/v1/list?limit=${pageSize}&page=${currentPage}`
            : null,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        },
    );

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
                router.push(`/${activeOrganization.slug}/templates/${template.id}`);
            }
        } catch (error) {
            console.error("Failed to create template:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

    // Filter templates based on search query
    const filteredTemplates =
        data?.templates?.filter((template) => {
            const matchesSearch =
                searchQuery === "" ||
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        }) || [];

    return (
        <div className="mx-auto max-w-3xl sm:px-8">
            <div className="flex items-center justify-between pt-10">
                <p className="font-medium text-2xl">
                    Template{data?.templates.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                    <Button.Root
                        variant="neutral"
                        size="xsmall"
                        onClick={handleCreateTemplate}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <Spinner size={16} />
                        ) : (
                            <Icon name="plus" className="h-4 w-4" />
                        )}
                        {isCreating ? "Creating..." : "Create template"}
                    </Button.Root>
                </div>
            </div>
            <div>
                {error ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-4">
                        <Icon name="alert-circle" className="h-8 w-8 text-red-500" />
                        <p className="text-center text-sm text-text-sub-600">
                            Failed to load templates
                        </p>
                    </div>
                ) : data?.templates && data.templates.length === 0 ? (
                    <EmptyState orgSlug={activeOrganization.slug} />
                ) : (
                    <div>
                        <div className="mt-10 flex items-center gap-3">
                            <div className="flex-1">
                                <Input.Root size="small" className="rounded-xl">
                                    <Input.Wrapper>
                                        <Input.Icon
                                            as={() => <Icon name="search" className="h-4 w-4" />}
                                        />
                                        <Input.Input
                                            type="text"
                                            placeholder="Search templates..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </Input.Wrapper>
                                </Input.Root>
                            </div>
                        </div>
                        <div className="mt-4">
                            <TemplateTable
                                templates={filteredTemplates}
                                activeOrganizationSlug={activeOrganization.slug}
                                isLoading={isLoading}
                                loadingRows={4}
                                onMutate={mutate}
                            />
                        </div>

                        {/* Pagination */}
                        {data && data.total > 0 && (
                            <div className="mt-4 pb-8 flex items-center justify-between text-paragraph-sm text-text-sub-600">
                                <div className="flex items-center gap-3">
                                    <span>
                                        Showing {startIndex}–{endIndex} of {data.total} template{data.total !== 1 ? "s" : ""}
                                    </span>
                                    <PageSizeDropdown
                                        value={pageSize}
                                        onValueChange={(value) => {
                                            setPageSize(value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button.Root
                                        variant="neutral"
                                        mode="stroke"
                                        size="xxsmall"
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1 || isLoading}
                                        className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
                                    >
                                        <Icon name="chevron-left" className="h-4 w-4" />
                                    </Button.Root>
                                    <span className="px-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button.Root
                                        variant="neutral"
                                        mode="stroke"
                                        size="xxsmall"
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages || isLoading}
                                        className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
                                    >
                                        <Icon name="chevron-right" className="h-4 w-4" />
                                    </Button.Root>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
