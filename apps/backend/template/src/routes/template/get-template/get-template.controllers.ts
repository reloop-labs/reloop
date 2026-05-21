import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { log } from "evlog";

export async function getTemplate(params: {
	id: string;
	organizationId: string;
}) {
	const { id, organizationId } = params;

	try {
		const template = await templateModel.findByIdAndOrg(id, organizationId);

		if (!template) {
			throw TemplateErrors.notFound(id);
		}

		return template;
	} catch (error) {
		log.error({
			message: "Error getting template",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
