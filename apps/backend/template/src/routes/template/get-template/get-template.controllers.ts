import { TemplateError } from "@be/template/error/template.error";
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
			throw TemplateError.notFound(id);
		}

		return template;
	} catch (error) {
		console.error(`Error getting template: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
