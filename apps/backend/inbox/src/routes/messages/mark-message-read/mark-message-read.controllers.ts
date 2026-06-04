import { updateMessageController } from "../update-message/update-message.controllers";

export async function markMessageReadController(
	id: string,
	organizationId: string,
	isRead: boolean,
) {
	return updateMessageController(id, organizationId, { isRead });
}
