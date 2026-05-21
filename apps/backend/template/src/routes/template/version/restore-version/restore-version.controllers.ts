import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";

export async function restoreVersion(params: {
	templateId: string;
	versionId: string;
	organizationId: string;
}) {
	const { templateId, versionId, organizationId } = params;

	// Verify template exists and belongs to org
	const template = await templateModel.findByIdAndOrg(
		templateId,
		organizationId,
	);
	if (!template) {
		throw TemplateErrors.notFound(templateId);
	}

	// Find the version record
	const version = await templateVersionModel.findById(versionId);
	if (!version || version.templateId !== templateId) {
		throw TemplateErrors.versionNotFoundById(versionId);
	}

	// Update the parent template to match the version
	const result = await templateModel.update({
		id: templateId,
		content: version.content,
		subject: version.subject || undefined,
		variables: version.variables || [],
		currentVersion: version.version,
	});

	return result;
}
