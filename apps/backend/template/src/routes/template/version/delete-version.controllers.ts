import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";

export async function deleteVersion(params: {
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

	// Verify it's not the active version
	if (
		template.currentVersion !== null &&
		version.version === template.currentVersion
	) {
		throw TemplateErrors.deleteFailed(
			"Cannot delete the active template version.",
		);
	}

	// Perform the deletion
	const result = await templateVersionModel.delete(versionId);
	return result;
}
