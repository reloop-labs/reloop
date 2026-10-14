import { ApiKeysApi } from "./api-keys";
import { AutomationsApi } from "./automations";
import { BimiApi } from "./bimi";
import { ChannelsApi } from "./channels";
import { ReloopClient, type ReloopClientOptions } from "./client";
import { ContactsApi } from "./contacts";
import { DomainAgeApi } from "./domain-age";
import { DomainReputationApi } from "./domain-reputation";
import { DomainsApi } from "./domains";
import { EmailLogsApi } from "./email-logs";
import { GroupsApi } from "./groups";
import { InboxApi } from "./inbox";
import { MailApi } from "./mail";
import { PropertiesApi } from "./properties";
import { SmtpProvidersApi } from "./smtp-providers";
import { TempEmailApi } from "./temp-email";
import { TemplatesApi } from "./templates";
import { WorkflowEventsApi } from "./workflow-events";

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
	smtpProviders: SmtpProvidersApi;
	tempEmail: TempEmailApi;
	domainReputation: DomainReputationApi;
	domainAge: DomainAgeApi;
	bimi: BimiApi;
	inbox: InboxApi;
	automations: AutomationsApi;
	workflowEvents: WorkflowEventsApi;
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
		smtpProviders: new SmtpProvidersApi(client),
		tempEmail: new TempEmailApi(client),
		domainReputation: new DomainReputationApi(client),
		domainAge: new DomainAgeApi(client),
		bimi: new BimiApi(client),
		inbox: new InboxApi(client),
		automations: new AutomationsApi(client),
		workflowEvents: new WorkflowEventsApi(client),
	};
}
