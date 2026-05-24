import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import type { TemplateBlock } from "@reloop/db/schema";
import { log } from "evlog";

export async function createVersion(params: {
	templateId: string;
	organizationId: string;
	userId: string;
	content: TemplateBlock[];
	subject?: string;
	fromEmail?: string;
	replyTo?: string;
	previewText?: string;
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
		fromEmail,
		replyTo,
		previewText,
		description,
		name,
		isMajor,
		renderedHtml,
	} = params;

	log.info({
		...{ templateId, organizationId, userId, isMajor, name },
		message: "Creating template version",
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
			fromEmail: fromEmail ?? existing.fromEmail ?? undefined,
			replyTo: replyTo ?? existing.replyTo ?? undefined,
			previewText: previewText ?? existing.previewText ?? undefined,
			description,
			content,
			createdByUserId: userId,
			name: versionName,
			isMajor,
			renderedHtml,
		});

		if (!result) {
			throw TemplateErrors.createFailed("Failed to create template version");
		}

		// When publishing, update the parent template status and version
		if (isMajor) {
			await templateModel.update({
				id: templateId,
				status: "published",
				currentVersion: nextVersion,
			});
		}

		log.info({
			...{ templateId, versionId: result.id, version: nextVersion, isMajor },
			message: "Template version created successfully",
		});

		return {
			...result,
			draftNumber,
			publishNumber,
		};
	} catch (error) {
		log.error({
			...{ templateId, organizationId, userId },
			message: "Error creating template version",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
