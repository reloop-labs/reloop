"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { EmptyState } from "./empty-state";
import { TemplateGrid } from "./template-grid";

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
	const currentPage = 1;
	const pageSize = 100;

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
				router.push(`/templates/${template.id}`);
			}
		} catch (error) {
			console.error("Failed to create template:", error);
		} finally {
			setIsCreating(false);
		}
	};

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
					<EmptyState />
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
							<TemplateGrid
								templates={filteredTemplates}
								isLoading={isLoading}
								loadingRows={6}
								onMutate={mutate}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
