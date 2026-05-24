import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import { log } from "evlog";

export async function listVersions(params: {
	templateId: string;
	organizationId: string;
}) {
	const { templateId, organizationId } = params;

	log.info({
		...{ templateId, organizationId },
		message: "Listing template versions",
	});

	try {
		// Verify template exists and belongs to org
		const existing = await templateModel.findByIdAndOrg(
			templateId,
			organizationId,
		);
		if (!existing) {
			throw TemplateErrors.notFound(templateId);
		}

		const versions = await templateVersionModel.listByTemplate(templateId);

		log.info({
			...{ templateId, versionCount: versions.length },
			message: "Successfully listed template versions",
		});

		return versions;
	} catch (error) {
		log.error({
			...{ templateId, organizationId },
			message: "Error listing template versions",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
