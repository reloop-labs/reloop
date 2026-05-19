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
	name?: string;
	isMajor?: boolean;
	renderedHtml?: string;
}) {
	const {
		templateId,
		organizationId,
		userId,
		content,
		subject,
		description,
		name,
		isMajor,
		renderedHtml,
	} = params;

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

	// Auto-generate name based on type if not provided
	let versionName = name;
	let draftNumber: number | undefined;
	let publishNumber: number | undefined;

	if (isMajor) {
		// Published version: count existing published + 1
		const publishedCount =
			await templateVersionModel.countPublishedByTemplate(templateId);
		publishNumber = publishedCount + 1;
		if (!versionName) {
			versionName = `v${publishNumber}`;
		}
	} else {
		// Draft: count existing drafts + 1
		const draftCount =
			await templateVersionModel.countDraftsByTemplate(templateId);
		draftNumber = draftCount + 1;
		if (!versionName) {
			versionName = `Draft ${draftNumber}`;
		}
	}

	const result = await templateVersionModel.create({
		templateId,
		version: nextVersion,
		subject: subject ?? existing.subject ?? undefined,
		description,
		content,
		createdByUserId: userId,
		name: versionName,
		isMajor,
		renderedHtml,
	});

	// When publishing, update the parent template status and version
	if (isMajor) {
		await templateModel.update({
			id: templateId,
			status: "published",
			currentVersion: nextVersion,
		});
	}

	return {
		...result,
		draftNumber,
		publishNumber,
	};
}
