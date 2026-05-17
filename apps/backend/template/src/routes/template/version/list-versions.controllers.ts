import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";

export async function listVersions(params: {
	templateId: string;
	organizationId: string;
}) {
	const { templateId, organizationId } = params;

	// Verify template exists and belongs to org
	const existing = await templateModel.findByIdAndOrg(
		templateId,
		organizationId,
	);
	if (!existing) {
		throw TemplateError.notFound(templateId);
	}

	const versions = await templateVersionModel.listByTemplate(templateId);
	return versions;
}
