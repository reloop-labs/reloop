import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import { templateVersionModel } from "@be/template/model/template-version.model";
import { parseHtmlToImageRequest } from "@be/template/utils/html-document";
import { renderHtmlToImage } from "@be/template/utils/html-to-image";
import { uploadPng } from "@be/template/utils/s3";
import { log } from "evlog";

const inflight = new Map<string, Promise<ThumbnailResult>>();

export type ThumbnailResult = {
	bytes: Uint8Array;
	url: string | null;
};

function thumbnailKey(organizationId: string, templateId: string) {
	return `templates/${organizationId}/${templateId}/thumbnail.png`;
}

export async function renderAndStoreThumbnail(params: {
	templateId: string;
	organizationId: string;
	html: string;
}): Promise<ThumbnailResult> {
	const request = parseHtmlToImageRequest({
		html: params.html,
		width: 640,
		format: "png",
	});
	const bytes = await renderHtmlToImage(request);

	let url: string | null = null;
	try {
		url = await uploadPng(
			thumbnailKey(params.organizationId, params.templateId),
			bytes,
		);
		await templateModel.update({
			id: params.templateId,
			thumbnailUrl: url,
		});
	} catch (error) {
		log.warn({
			message: "Rendered template thumbnail but failed to persist it",
			templateId: params.templateId,
			error: error instanceof Error ? error.message : String(error),
		});
	}

	return { bytes, url };
}

export async function refreshTemplateThumbnail(params: {
	templateId: string;
	organizationId: string;
	html: string;
}): Promise<ThumbnailResult> {
	const existing = inflight.get(params.templateId);
	if (existing) return existing;

	const job = renderAndStoreThumbnail(params).finally(() => {
		inflight.delete(params.templateId);
	});
	inflight.set(params.templateId, job);
	return job;
}

const DRAFT_THUMBNAIL_DEBOUNCE_MS = 5000;
const draftTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Refresh the thumbnail from autosaved draft HTML. Autosave fires every few
 * seconds while typing, so renders are debounced per template and only the
 * latest HTML is captured.
 */
export function scheduleDraftThumbnail(params: {
	templateId: string;
	organizationId: string;
	html: string;
}) {
	const pending = draftTimers.get(params.templateId);
	if (pending) clearTimeout(pending);

	draftTimers.set(
		params.templateId,
		setTimeout(() => {
			draftTimers.delete(params.templateId);
			refreshTemplateThumbnail(params).catch((error) => {
				log.warn({
					message: "Draft template thumbnail refresh failed",
					templateId: params.templateId,
					error: error instanceof Error ? error.message : String(error),
				});
			});
		}, DRAFT_THUMBNAIL_DEBOUNCE_MS),
	);
}

export async function resolveTemplateThumbnail(params: {
	templateId: string;
	organizationId: string;
}): Promise<ThumbnailResult> {
	const template = await templateModel.findByIdAndOrg(
		params.templateId,
		params.organizationId,
	);
	if (!template) throw TemplateErrors.notFound(params.templateId);

	if (template.thumbnailUrl) {
		return { bytes: new Uint8Array(), url: template.thumbnailUrl };
	}

	const latest = await templateVersionModel.getLatestVersion(params.templateId);
	const html = latest?.renderedHtml?.trim() || "";
	if (!html) {
		throw TemplateErrors.thumbnailNotFound(params.templateId);
	}

	return refreshTemplateThumbnail({
		templateId: params.templateId,
		organizationId: params.organizationId,
		html,
	});
}
