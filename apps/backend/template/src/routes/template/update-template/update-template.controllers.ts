import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import type { TemplateBlock } from "@reloop/db/schema";
import { log } from "evlog";

export async function updateTemplate(params: {
	id: string;
	organizationId: string;
	name?: string;
	description?: string;
	subject?: string;
	content?: TemplateBlock[];
	variables?: string[];
	status?: "draft" | "published" | "archived";
}) {
	const { id, organizationId, ...updateData } = params;

	try {
		// Verify template exists and belongs to org
		const existing = await templateModel.findByIdAndOrg(id, organizationId);
		if (!existing) {
			throw TemplateError.notFound(id);
		}

		const result = await templateModel.update({
			id,
			...updateData,
		});

		return result;
	} catch (error) {
		console.error(`Error updating template: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
