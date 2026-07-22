import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import {
	extractVariablesFromContent,
	normalizeVariableName,
} from "@be/template/utils/extract-variables";
import type { TemplateBlock } from "@reloop/db/schema";
import { log } from "evlog";

export async function createTemplate(params: {
	organizationId: string;
	userId: string;
	name: string;
	description?: string;
	subject?: string;
	content?: TemplateBlock[];
}) {
	const { organizationId, userId, name, description, subject, content } =
		params;

	try {
		if (!name || name.trim().length === 0) {
			throw TemplateErrors.nameRequired();
		}

		// Auto-extract variables from initial content if provided
		const rawVariables =
			content && content.length > 0 ? extractVariablesFromContent(content) : [];

		const variables = rawVariables.map((raw) => ({
			name: normalizeVariableName(raw),
			type: "string" as const,
			defaultValue: null,
		}));

		const result = await templateModel.create({
			name: name.trim(),
			description,
			subject,
			organizationId,
			createdByUserId: userId,
			content: content || [],
			variables,
		});

		if (!result) {
			throw TemplateErrors.createFailed();
		}

		return result;
	} catch (error) {
		log.error({
			message: "Error creating template",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
