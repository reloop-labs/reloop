import { useParams } from "next/navigation";
import { createContext, useContext } from "react";

/** Resolved template ID; the URL segment may be a slug, so read this instead. */
export const TemplateIdContext = createContext<string | null>(null);

/** Template id for the editor at `/templates/$slugOrId`. */
export function useTemplateId(): string {
	const resolved = useContext(TemplateIdContext);
	const params = useParams() as { templateId?: string };
	return resolved ?? params.templateId ?? "";
}
