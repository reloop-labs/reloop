import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import { TEMPLATE_ERROR_CODES } from "../../../template.error-code";

export async function restoreVersion(params: {
	templateId: string;
	versionId: string;
	organizationId: string;
}) {
	const { templateId, versionId, organizationId } = params;

	// Verify template exists and belongs to org
	const template = await templateModel.findByIdAndOrg(templateId, organizationId);
	if (!template) {
		throw TemplateError.notFound(templateId);
	}

	// Find the version record
	const version = await templateVersionModel.findById(versionId);
	if (!version || version.templateId !== templateId) {
		throw new TemplateError(
			TEMPLATE_ERROR_CODES.TEMPLATE_VERSION_NOT_FOUND,
			"Version not found",
			404
		);
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
