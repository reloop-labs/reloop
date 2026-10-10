import { ReloopClient, type ReloopClientOptions } from "./client";
import { ContactsApi } from "./contacts";
import { MailApi } from "./mail";

export type ReloopApi = { contacts: ContactsApi; mail: MailApi };

export function createReloopApi(options: ReloopClientOptions): ReloopApi {
	const client = new ReloopClient(options);
	return { contacts: new ContactsApi(client), mail: new MailApi(client) };
}
