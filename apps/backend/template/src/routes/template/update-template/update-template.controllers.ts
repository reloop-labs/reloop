import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import {
	extractVariablesFromContent,
	normalizeVariableName,
} from "@be/template/utils/extract-variables";
import {
	isGeneratedSlugFor,
	isTemplateSlugTaken,
	isValidTemplateSlug,
	uniqueTemplateSlug,
} from "@be/template/utils/slug";
import type { TemplateBlock, TemplateVariable } from "@reloop/db/schema";
import { log } from "evlog";

export async function updateTemplate(params: {
	id: string;
	organizationId: string;
	name?: string;
	slug?: string;
	description?: string;
	subject?: string;
	fromEmail?: string;
	replyTo?: string;
	previewText?: string;
	content?: TemplateBlock[];
	variables?: TemplateVariable[];
	status?: "draft" | "published" | "archived";
}) {
	const { id, organizationId, ...updateData } = params;

	try {
		const existing = await templateModel.findByIdAndOrg(id, organizationId);
		if (!existing) throw TemplateErrors.notFound(id);

		let followsRename = false;
		if (updateData.slug !== undefined) {
			const slug = updateData.slug.trim();
			if (!isValidTemplateSlug(slug)) throw TemplateErrors.invalidSlug(slug);
			if (
				slug !== existing.slug &&
				(await isTemplateSlugTaken(organizationId, slug, id))
			) {
				throw TemplateErrors.slugTaken(slug);
			}
			updateData.slug = slug;
		} else if (
			updateData.name !== undefined &&
			updateData.name.trim() !== existing.name &&
			isGeneratedSlugFor(existing.slug, existing.name) &&
			!(await templateModel.hasPublishedVersion(id))
		) {
			// Until first publish, an untouched slug follows renames so
			// "Untitled" → "Welcome email" doesn't leave `untitled-7` behind.
			// After that the slug is frozen: API callers may depend on it.
			updateData.slug = await uniqueTemplateSlug(
				organizationId,
				updateData.name,
				id,
			);
			followsRename = true;
		}

		const existingVars = existing.variables ?? [];
		const findExisting = (name: string) =>
			existingVars.find(
				(v) => normalizeVariableName(v.name) === normalizeVariableName(name),
			);

		if (
			updateData.content !== undefined &&
			updateData.variables === undefined
		) {
			const rawVariables = extractVariablesFromContent(updateData.content);
			updateData.variables = rawVariables.map((raw) => {
				const name = normalizeVariableName(raw);
				const existingVar = findExisting(name);
				if (existingVar) {
					return {
						...existingVar,
						name, // rewrite corrupted brace leftovers
					};
				}
				return {
					name,
					type: "string" as const,
					defaultValue: null,
				};
			});
		} else if (updateData.variables !== undefined) {
			// Normalize / dedupe explicit variable payloads
			// (also repairs legacy single-brace leftovers — not a supported syntax)
			const seen = new Set<string>();
			const cleaned: TemplateVariable[] = [];
			for (const variable of updateData.variables) {
				const name = normalizeVariableName(variable.name);
				if (!name || seen.has(name)) continue;
				seen.add(name);
				cleaned.push({
					...variable,
					name,
				});
			}
			updateData.variables = cleaned;
		}

		const result = await templateModel
			.update({ id, ...updateData })
			.catch((error) => {
				// A concurrent create took the generated slug: keep the old one
				// rather than failing the rename.
				if (followsRename && (error as { status?: number }).status === 409) {
					return templateModel.update({
						id,
						...updateData,
						slug: undefined,
					});
				}
				throw error;
			});

		if (!result) {
			throw TemplateErrors.updateFailed(id);
		}

		return result;
	} catch (error) {
		log.error({
			message: "Error updating template",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
