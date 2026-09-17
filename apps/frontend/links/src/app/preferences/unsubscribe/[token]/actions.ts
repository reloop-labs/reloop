"use server";

import { postMainListUnsubscribe } from "@reloop/links/lib/preferences-unsubscribe";

export async function unsubscribeContactAction(
	token: string,
): Promise<boolean> {
	return postMainListUnsubscribe(token);
}
