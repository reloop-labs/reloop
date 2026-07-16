import { useParams } from "@tanstack/react-router";

/** Template id from `/templates/$templateId` (and nested editor routes). */
export function useTemplateId(): string {
	const params = useParams({ strict: false }) as { templateId?: string };
	return params.templateId ?? "";
}
