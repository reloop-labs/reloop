import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
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

		const result = await templateModel.create({
			name: name.trim(),
			description,
			subject,
			organizationId,
			createdByUserId: userId,
			content: content || [],
			variables: [],
		});

		return result;
	} catch (error) {
		log.error({
			message: "Error creating template",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
