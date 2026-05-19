import { templateModel } from "@be/template/model/template.model";
import { templateConfig } from "@be/template/template.config";
import { log } from "evlog";

export async function listTemplates(params: {
	organizationId: string;
	page?: number;
	limit?: number;
}) {
	const {
		organizationId,
		page = 1,
		limit = templateConfig.constants.defaultPageSize,
	} = params;

	try {
		const safeLimit = Math.min(limit, templateConfig.constants.maxPageSize);
		const safePage = Math.max(1, page);

		const result = await templateModel.list(
			organizationId,
			safePage,
			safeLimit,
		);

		return result;
	} catch (error) {
		console.error(
			`Error listing templates: ${error instanceof Error ? error.message : String(error)}`,
		);
		throw error;
	}
}
