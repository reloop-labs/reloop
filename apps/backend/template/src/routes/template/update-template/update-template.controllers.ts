import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { extractVariablesFromContent } from "@be/template/utils/extract-variables";
import type { TemplateBlock, TemplateVariable } from "@reloop/db/schema";
import { log } from "evlog";

export async function updateTemplate(params: {
	id: string;
	organizationId: string;
	name?: string;
	description?: string;
	subject?: string;
	fromEmail?: string;
	replyTo?: string;
	previewText?: string;
	content?: TemplateBlock[];
	variables?: TemplateVariable[];
	status?: "draft" | "published" | "archived";
}) {
	const { id, organizationId, ...updateData } = params;

	try {
		const existing = await templateModel.findByIdAndOrg(id, organizationId);
		if (!existing) throw TemplateErrors.notFound(id);
		if (
			updateData.content !== undefined &&
			updateData.variables === undefined
		) {
			const rawVariables = extractVariablesFromContent(updateData.content);
			const existingVars = existing.variables ?? [];
			updateData.variables = rawVariables.map((raw) => {
				const name = raw.replace(/^\{\{|\}\}$/g, "").trim();
				const existingVar = existingVars.find((v) => v.name === name);
				if (existingVar) return existingVar;
				return {
					name,
					type: "string" as const,
					defaultValue: null,
				};
			});
		}

		const result = await templateModel.update({
			id,
			...updateData,
		});

		if (!result) {
			throw TemplateErrors.updateFailed(id);
		}

		return result;
	} catch (error) {
		log.error({
			message: "Error updating template",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
