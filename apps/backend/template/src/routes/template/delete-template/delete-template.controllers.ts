import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { logger } from "@reloop/logger";

export async function deleteTemplate(params: {
	id: string;
	organizationId: string;
}) {
	const { id, organizationId } = params;

	try {
		// Verify template exists and belongs to org
		const existing = await templateModel.findByIdAndOrg(id, organizationId);
		if (!existing) {
			throw TemplateError.notFound(id);
		}

		const result = await templateModel.softDelete(id);

		return { success: true, id: result?.id };
	} catch (error) {
		logger.error(
			{
				id,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting template",
		);
		throw error;
	}
}
