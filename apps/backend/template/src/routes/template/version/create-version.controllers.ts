import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import type { TemplateBlock } from "@reloop/db/schema";

export async function createVersion(params: {
	templateId: string;
	organizationId: string;
	userId: string;
	content: TemplateBlock[];
	subject?: string;
	description?: string;
}) {
	const { templateId, organizationId, userId, content, subject, description } =
		params;

	// Verify template exists and belongs to org
	const existing = await templateModel.findByIdAndOrg(
		templateId,
		organizationId,
	);
	if (!existing) {
		throw TemplateError.notFound(templateId);
	}

	const nextVersion =
		await templateVersionModel.getNextVersionNumber(templateId);

	const result = await templateVersionModel.create({
		templateId,
		version: nextVersion,
		subject: subject ?? existing.subject ?? undefined,
		description,
		content,
		createdByUserId: userId,
	});

	return result;
}
