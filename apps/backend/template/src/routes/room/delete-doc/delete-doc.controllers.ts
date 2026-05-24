import type { YjsPersistence } from "@be/template/utils/persistence";
import { log } from "evlog";

export async function deleteDocController(
	roomName: string,
	persistence: YjsPersistence | null,
) {
	log.info({
		roomName,
		message: "Deleting collaboration room document",
	});

	try {
		if (!persistence) {
			log.warn({
				roomName,
				message: "Persistence not available for deleting document",
			});
			return "NO_PERSISTENCE" as const;
		}

		await persistence.deleteDoc(roomName);

		log.info({
			roomName,
			message: "Successfully deleted collaboration room document",
		});

		return "SUCCESS" as const;
	} catch (error) {
		log.error({
			roomName,
			message: "Error deleting collaboration room document",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
