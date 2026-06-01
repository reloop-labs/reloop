import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { extractVariablesFromContent } from "@be/template/utils/extract-variables";
import type { TemplateBlock } from "@reloop/db/schema";
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
	variables?: string[];
	status?: "draft" | "published" | "archived";
}) {
	const { id, organizationId, ...updateData } = params;

	try {
		// Verify template exists and belongs to org
		const existing = await templateModel.findByIdAndOrg(id, organizationId);
		if (!existing) {
			throw TemplateErrors.notFound(id);
		}

		// Auto-extract variables from content when content is updated and
		// variables are not explicitly provided in the payload
		if (updateData.content !== undefined && updateData.variables === undefined) {
			updateData.variables = extractVariablesFromContent(updateData.content);
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
