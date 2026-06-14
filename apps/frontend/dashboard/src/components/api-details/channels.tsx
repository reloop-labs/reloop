import type * as Button from "@reloop/ui/button";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./channels-code-examples";

const operations = [
	{
		id: "add",
		label: "Create Channel",
		method: "POST",
		endpoint: "/api/contacts/v1/channels/create",
		docSlug: "post-api-contacts-v1-channels-create",
	},
	{
		id: "list",
		label: "List Channels",
		method: "GET",
		endpoint: "/api/contacts/v1/channels/list",
		docSlug: "get-api-contacts-v1-channels-list",
	},
	{
		id: "subscribe",
		label: "Subscribe",
		method: "POST",
		endpoint: "/api/contacts/v1/subscriptions/subscribe",
		docSlug: "post-api-contacts-v1-subscriptions-subscribe",
	},
	{
		id: "delete",
		label: "Delete Channel",
		method: "DELETE",
		endpoint: "/api/contacts/v1/channels/:channel_id",
		docSlug: "delete-api-contacts-v1-channels-channel_id",
	},
] as const;

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const ChannelsApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="Channels API"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="channels"
			buttonProps={props}
			codeExtraPadding={true}
		/>
	);
};
