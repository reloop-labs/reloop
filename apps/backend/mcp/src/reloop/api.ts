import { ApiKeysApi } from "./api-keys";
import { ChannelsApi } from "./channels";
import { ReloopClient, type ReloopClientOptions } from "./client";
import { ContactsApi } from "./contacts";
import { DomainsApi } from "./domains";
import { GroupsApi } from "./groups";
import { MailApi } from "./mail";

export type ReloopApi = {
	contacts: ContactsApi;
	groups: GroupsApi;
	channels: ChannelsApi;
	mail: MailApi;
	apiKeys: ApiKeysApi;
	domains: DomainsApi;
};

export function createReloopApi(options: ReloopClientOptions): ReloopApi {
	const client = new ReloopClient(options);
	return {
		contacts: new ContactsApi(client),
		groups: new GroupsApi(client),
		channels: new ChannelsApi(client),
		mail: new MailApi(client),
		apiKeys: new ApiKeysApi(client),
		domains: new DomainsApi(client),
	};
}
