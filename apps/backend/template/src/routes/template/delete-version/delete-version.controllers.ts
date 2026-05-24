import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import { log } from "evlog";

export async function deleteVersion(params: {
	templateId: string;
	versionId: string;
	organizationId: string;
}) {
	const { templateId, versionId, organizationId } = params;

	log.info({
		...{ templateId, versionId, organizationId },
		message: "Deleting template version",
	});

	try {
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
		if (!result) {
			throw TemplateErrors.deleteFailed("Failed to delete template version.");
		}

		log.info({
			...{ templateId, versionId },
			message: "Template version deleted successfully",
		});

		return result;
	} catch (error) {
		log.error({
			...{ templateId, versionId, organizationId },
			message: "Error deleting template version",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
