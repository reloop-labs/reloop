import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import {
	createTemplate,
	useInvalidateTemplates,
} from "#/features/templates/hooks/use-templates-query";

export function useCreateTemplateFlow() {
	const router = useRouter();
	const invalidate = useInvalidateTemplates();
	const setLastAiPrompt = useEditorStore((s) => s.setLastAiPrompt);
	const [prompt, setPrompt] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCreate = async (customPrompt?: string) => {
		const targetPrompt = (customPrompt ?? prompt).trim();
		if (isSubmitting) return;

		setIsSubmitting(true);
		try {
			// Create new template draft
			const template = await createTemplate();
			await invalidate();

			if (targetPrompt) {
				setLastAiPrompt(targetPrompt);
			}

			// Navigate into template editor
			router.push(`/templates/${template.id}`);
		} catch (error) {
			console.error("Failed to create template:", error);
			toast.error("Failed to create template. Please try again.");
			setIsSubmitting(false);
		}
	};

	return {
		prompt,
		setPrompt,
		isSubmitting,
		handleCreate,
	};
}
