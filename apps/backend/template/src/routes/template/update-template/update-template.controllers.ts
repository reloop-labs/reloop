import { TemplateErrors } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import {
	extractVariablesFromContent,
	normalizeVariableName,
} from "@be/template/utils/extract-variables";
import type { TemplateBlock, TemplateVariable } from "@reloop/db/schema";
import { log } from "evlog";

export async function updateTemplate(params: {
	id: string;
	organizationId: string;
	name?: string;
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

		const result = await templateModel.update({
			id,
			...updateData,
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
