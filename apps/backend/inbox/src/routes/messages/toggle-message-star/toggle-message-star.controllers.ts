import { updateMessageController } from "../update-message/update-message.controllers";

export async function toggleStarController(
	id: string,
	organizationId: string,
	isStarred: boolean,
) {
	return updateMessageController(id, organizationId, { isStarred });
}
