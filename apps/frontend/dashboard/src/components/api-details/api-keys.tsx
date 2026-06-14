import type * as Button from "@reloop/ui/button";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./api-keys-code-examples";

const operations = [
	{
		id: "create",
		label: "Create Key",
		method: "POST",
		endpoint: "/api-key/v1/",
		docSlug: "post-api-key-v1",
	},
	{
		id: "list",
		label: "List Keys",
		method: "GET",
		endpoint: "/api-key/v1/",
		docSlug: "get-api-key-v1",
	},
	{
		id: "rotate",
		label: "Rotate Key",
		method: "POST",
		endpoint: "/api-key/v1/:id/rotate",
		docSlug: "post-api-key-v1-id-rotate",
	},
	{
		id: "disable",
		label: "Disable Key",
		method: "POST",
		endpoint: "/api-key/v1/:id/disable",
		docSlug: "post-api-key-v1-id-disable",
	},
] as const;

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const ApiKeysApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="API Keys API"
			description="Create and manage API keys programmatically with the REST API"
			hotkey="a"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="api-keys"
			buttonProps={props}
		/>
	);
};
