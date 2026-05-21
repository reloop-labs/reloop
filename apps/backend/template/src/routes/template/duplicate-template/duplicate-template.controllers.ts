import { TemplateError } from "@be/template/error/template.error";
import { templateModel } from "@be/template/model/template.model";
import type { YjsPersistence } from "@be/template/utils/persistence";
import { log } from "evlog";

export async function duplicateTemplate(params: {
	id: string;
	organizationId: string;
	userId: string;
	persistence?: YjsPersistence | null;
}) {
	const { id, organizationId, userId, persistence } = params;

	try {
		const result = await templateModel.duplicate(id, organizationId, userId);

		if (!result) {
			throw TemplateError.notFound(id);
		}

		// Duplicate Yjs collaborative document state if it exists
		if (persistence) {
			try {
				const doc = await persistence.getDoc(id);
				if (doc) {
					await persistence.writeState(result.id, doc);
					log.info({
						templateId: result.id,
						message: `[duplicate] Duplicated Yjs document state from ${id} to ${result.id}`,
					});
				}
			} catch (err) {
				console.warn(
					`[duplicate] Failed to duplicate Yjs document state from ${id} to ${result.id}: ${
						err instanceof Error ? err.message : String(err)
					}`,
				);
			}
		}

		return result;
	} catch (error) {
		console.error(
			`Error duplicating template: ${error instanceof Error ? error.message : String(error)}`,
		);
		throw error;
	}
}
