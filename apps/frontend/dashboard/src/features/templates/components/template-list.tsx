import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Spinner from "@reloop/ui/spinner";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	createTemplate,
	useInvalidateTemplates,
	useTemplatesQuery,
} from "#/features/templates/hooks/use-templates-query";
import { EmptyState } from "./empty-state";
import { TemplateGrid } from "./template-grid";

export function TemplateList() {
	const navigate = useNavigate();
	const invalidate = useInvalidateTemplates();
	const [searchQuery, setSearchQuery] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const { data, error, isPending, isFetching, refetch } = useTemplatesQuery();
	const isLoading = isPending || (isFetching && !data);

	const handleCreateTemplate = async () => {
		setIsCreating(true);
		try {
			const template = await createTemplate();
			await invalidate();
			void navigate({
				to: "/templates/$templateId",
				params: { templateId: template.id },
			});
		} catch {
			toast.error("Failed to create template");
		} finally {
			setIsCreating(false);
		}
	};

	const filteredTemplates =
		data?.templates?.filter((template) => {
			const matchesSearch =
				searchQuery === "" ||
				template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				template.description?.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesSearch;
		}) || [];

	return (
		<div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
			<div className="flex items-center justify-between pb-6">
				<p className="font-medium text-2xl">
					Template{data?.templates.length !== 1 ? "s" : ""}
				</p>
				<div className="flex items-center gap-2">
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={() => void handleCreateTemplate()}
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
						<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load templates
						</p>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => void refetch()}
						>
							Retry
						</Button.Root>
					</div>
				) : data?.templates && data.templates.length === 0 ? (
					<EmptyState />
				) : (
					<div>
						<div className="mt-2 flex items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon as={Icon} name="search" />
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
								onMutate={() => void invalidate()}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
