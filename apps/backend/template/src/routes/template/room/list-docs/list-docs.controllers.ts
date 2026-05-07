import type { YjsPersistence } from "@be/template/utils/persistence";

export async function listDocsController(persistence: YjsPersistence | null) {
	if (!persistence) {
		return { docs: [] };
	}

	const docs = await persistence.listDocs();
	return { docs };
}
