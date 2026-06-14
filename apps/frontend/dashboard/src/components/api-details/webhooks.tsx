import type * as Button from "@reloop/ui/button";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./webhooks-code-examples";

const operations = [
	{
		id: "create",
		label: "Create Webhook",
		method: "POST",
		endpoint: "/webhook/v1/",
		docSlug: "post-webhook-v1",
	},
	{
		id: "list",
		label: "List Webhooks",
		method: "GET",
		endpoint: "/webhook/v1/",
		docSlug: "get-webhook-v1",
	},
	{
		id: "delete",
		label: "Delete Webhook",
		method: "DELETE",
		endpoint: "/webhook/v1/:id",
		docSlug: "delete-webhook-v1-id",
	},
] as const;

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const WebhooksApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="Webhooks API"
			description="Create and manage webhooks programmatically with the REST API"
			hotkey="c"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="webhooks"
			buttonProps={props}
		/>
	);
};
