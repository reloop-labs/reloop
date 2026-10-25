import { templateModel } from "@be/template/model/template.model";
import { templateConfig } from "@be/template/template.config";
import { decodeCursor } from "@reloop/db/pagination";
import { log } from "evlog";

export async function listTemplates(params: {
	organizationId: string;
	page?: number;
	limit?: number;
	cursor?: string;
}) {
	const {
		organizationId,
		page = 1,
		limit = templateConfig.constants.defaultPageSize,
		cursor,
	} = params;
	// With a cursor, pagination is keyset-based and `page` is ignored.
	const position = cursor ? decodeCursor(cursor) : null;

	try {
		const safeLimit = Math.min(limit, templateConfig.constants.maxPageSize);
		const safePage = Math.max(1, page);

		const result = await templateModel.list(
			organizationId,
			safePage,
			safeLimit,
			position,
		);

		return result;
	} catch (error) {
		log.error({
			message: "Error listing templates",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
