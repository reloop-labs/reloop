import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { log } from "evlog";

export async function getTemplateBySlug(params: {
	slug: string;
	organizationId: string;
}) {
	const { slug, organizationId } = params;

	try {
		const template = await templateModel.findBySlugAndOrg(slug, organizationId);

		if (!template) {
			throw TemplateErrors.slugNotFound(slug);
		}

		return template;
	} catch (error) {
		log.error({
			message: "Error getting template by slug",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
