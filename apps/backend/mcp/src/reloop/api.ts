import { ApiKeysApi } from "./api-keys";
import { ChannelsApi } from "./channels";
import { ReloopClient, type ReloopClientOptions } from "./client";
import { ContactsApi } from "./contacts";
import { DomainsApi } from "./domains";
import { EmailLogsApi } from "./email-logs";
import { GroupsApi } from "./groups";
import { MailApi } from "./mail";
import { PropertiesApi } from "./properties";
import { TemplatesApi } from "./templates";

export type ReloopApi = {
	contacts: ContactsApi;
	groups: GroupsApi;
	channels: ChannelsApi;
	properties: PropertiesApi;
	mail: MailApi;
	emailLogs: EmailLogsApi;
	templates: TemplatesApi;
	apiKeys: ApiKeysApi;
	domains: DomainsApi;
};

export function createReloopApi(options: ReloopClientOptions): ReloopApi {
	const client = new ReloopClient(options);
	return {
		contacts: new ContactsApi(client),
		groups: new GroupsApi(client),
		channels: new ChannelsApi(client),
		properties: new PropertiesApi(client),
		mail: new MailApi(client),
		emailLogs: new EmailLogsApi(client),
		templates: new TemplatesApi(client),
		apiKeys: new ApiKeysApi(client),
		domains: new DomainsApi(client),
	};
}
