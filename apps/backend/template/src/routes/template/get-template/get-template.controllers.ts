import { log } from "evlog";
import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";


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
		log.error({
				id,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting template",
		);
		throw error;
	}
}
