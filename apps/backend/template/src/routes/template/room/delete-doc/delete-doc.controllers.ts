import type { YjsPersistence } from "@be/template/utils/persistence";

export async function deleteDocController(
	roomName: string,
	persistence: YjsPersistence | null,
) {
	if (!persistence) {
		return "NO_PERSISTENCE" as const;
	}

	await persistence.deleteDoc(roomName);
	return "SUCCESS" as const;
}
