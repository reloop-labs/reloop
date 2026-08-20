import { useParams } from "next/navigation";

/** Template id from `/templates/$templateId` (and nested editor routes). */
export function useTemplateId(): string {
	const params = useParams() as { templateId?: string };
	return params.templateId ?? "";
}
