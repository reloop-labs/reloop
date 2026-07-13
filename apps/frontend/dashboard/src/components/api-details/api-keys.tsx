import type * as Button from "@reloop/ui/button";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./api-keys-code-examples";

const operations = [
	{
		id: "create",
		label: "Create Key",
		method: "POST",
		endpoint: "/api/api-key/v1/",
		docSlug: "post-api-api-key-v1",
	},
	{
		id: "list",
		label: "List Keys",
		method: "GET",
		endpoint: "/api/api-key/v1/",
		docSlug: "get-api-api-key-v1",
	},
	{
		id: "get",
		label: "Get Key",
		method: "GET",
		endpoint: "/api/api-key/v1/:id",
		docSlug: "get-api-api-key-v1by-api_key_id",
	},
	{
		id: "update",
		label: "Update Key",
		method: "PATCH",
		endpoint: "/api/api-key/v1/:id",
		docSlug: "patch-api-api-key-v1by-api_key_id",
	},
	{
		id: "delete",
		label: "Delete Key",
		method: "DELETE",
		endpoint: "/api/api-key/v1/:id",
		docSlug: "delete-api-api-key-v1by-api_key_id",
	},
	{
		id: "rotate",
		label: "Rotate Key",
		method: "POST",
		endpoint: "/api/api-key/v1/rotate/:id",
		docSlug: "post-api-api-key-v1rotate-by-api_key_id",
	},
	{
		id: "enable",
		label: "Enable Key",
		method: "POST",
		endpoint: "/api/api-key/v1/enable/:id",
		docSlug: "post-api-api-key-v1enable-by-api_key_id",
	},
	{
		id: "disable",
		label: "Disable Key",
		method: "POST",
		endpoint: "/api/api-key/v1/disable/:id",
		docSlug: "post-api-api-key-v1disable-by-api_key_id",
	},
] as const;

const languages = [
	{ id: "nodejs", label: "Node", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const ApiKeysApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="API Keys API"
			hotkey="a"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="api-key"
			buttonProps={props}
			codeExtraPadding={true}
		/>
	);
};
