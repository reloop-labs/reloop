import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type Template = {
	id: string;
	name: string;
	description: string | null;
	subject: string | null;
	status: "draft" | "published" | "archived";
	content?: unknown[] | null;
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

export async function createTemplate(): Promise<Template> {
	const res = await fetch("/api/template/v1/create", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({
			name: "Untitled",
			content: [],
		}),
	});
	if (!res.ok) throw new Error(`Failed to create template (${res.status})`);
	return res.json() as Promise<Template>;
}
