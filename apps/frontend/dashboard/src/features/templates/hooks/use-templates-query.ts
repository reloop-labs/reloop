import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { templateHref } from "#/features/templates/lib/template-href";
import { queryKeys } from "#/lib/query-keys";

export type Template = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	subject: string | null;
	fromEmail?: string | null;
	replyTo?: string | null;
	previewText?: string | null;
	status: "draft" | "published" | "archived";
	content?: unknown[] | null;
	thumbnailUrl?: string | null;
	createdAt: string;
	updatedAt: string;
};

export type TemplateListResponse = {
	templates: Template[];
	total: number;
	page: number;
	limit: number;
};

export function useTemplatesQuery(enabled = true) {
	const { activeOrganization } = useActiveOrganization();
	return useQuery({
		queryKey: queryKeys.templates.list(),
		queryFn: async () => {
			const res = await fetch("/api/template/v1/list?limit=100&page=1", {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
			return res.json() as Promise<TemplateListResponse>;
		},
		enabled: enabled && !!activeOrganization?.id,
	});
}

export function useTemplateDetailQuery(templateId: string | null | undefined) {
	return useQuery({
		queryKey: queryKeys.templates.detail(templateId ?? ""),
		queryFn: async () => {
			const res = await fetch(`/api/template/v1/${templateId}`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to load template (${res.status})`);
			return res.json() as Promise<Template>;
		},
		enabled: !!templateId,
	});
}

export function useInvalidateTemplates() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
}

export type CreateTemplateInput = {
	name?: string;
	subject?: string;
	fromEmail?: string;
	replyTo?: string;
	content?: unknown[];
};

export async function createTemplate(
	input: CreateTemplateInput = {},
): Promise<Template> {
	const res = await fetch("/api/template/v1/create", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({
			name: input.name || "Untitled",
			subject: input.subject,
			fromEmail: input.fromEmail,
			replyTo: input.replyTo,
			content: input.content ?? [],
		}),
	});
	if (!res.ok) throw new Error(`Failed to create template (${res.status})`);
	return res.json() as Promise<Template>;
}

/** Create a new template and navigate directly to the editor. Shared by header, empty state, ⌘K, and "Save as template" on email detail. */
export function useCreateTemplate() {
	const router = useRouter();
	const invalidate = useInvalidateTemplates();
	const [isCreating, setIsCreating] = useState(false);

	const create = useCallback(
		async (input?: CreateTemplateInput) => {
			if (isCreating) return;
			setIsCreating(true);
			try {
				const template = await createTemplate(input);
				await invalidate();
				router.push(templateHref(template));
			} catch (error) {
				console.error("Failed to create template:", error);
				toast.error("Failed to create template. Please try again.");
				setIsCreating(false);
			}
		},
		[isCreating, invalidate, router],
	);

	return { isCreating, create };
}
