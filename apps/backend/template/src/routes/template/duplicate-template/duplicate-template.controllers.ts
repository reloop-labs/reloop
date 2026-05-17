import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { log } from "evlog";

export async function duplicateTemplate(params: {
	id: string;
	organizationId: string;
	userId: string;
}) {
	const { id, organizationId, userId } = params;

	try {
		const result = await templateModel.duplicate(id, organizationId, userId);

		if (!result) {
			throw TemplateError.notFound(id);
		}

		return result;
	} catch (error) {
		log.error(
			{
				id,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error duplicating template",
		);
		throw error;
	}
}
