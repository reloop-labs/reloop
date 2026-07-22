import type * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./channels-code-examples";

const operations = [
	{
		id: "add",
		label: "Create Channel",
		docSlug: "post-api-contacts-v1channels-create",
	},
	{
		id: "get",
		label: "Retrieve Channel",
		docSlug: "get-api-contacts-v1channels-by-channel_id",
	},
	{
		id: "list",
		label: "List Channels",
		docSlug: "get-api-contacts-v1channels-list",
	},
	{
		id: "update",
		label: "Update Channel",
		docSlug: "patch-api-contacts-v1channels-by-channel_id",
	},
	{
		id: "delete",
		label: "Delete Channel",
		docSlug: "delete-api-contacts-v1channels-by-channel_id",
	},
] as const;

const languages = [
	{ id: "nodejs", label: "Node.js", shikiLang: "javascript" },
	{ id: "ruby", label: "Ruby", shikiLang: "ruby" },
	{ id: "php", label: "PHP", shikiLang: "php" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "go", label: "Go", shikiLang: "go" },
	{ id: "rust", label: "Rust", shikiLang: "rust" },
	{ id: "java", label: "Java", shikiLang: "java" },
	{ id: "dotnet", label: ".NET", shikiLang: "csharp" },
	{ id: "curl", label: "cURL", shikiLang: "bash" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const ChannelsApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="Channels API"
			icon={<Icon name="notification-indicator" className="h-6 w-6 text-text-strong-950 dark:text-white" />}
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="contacts/channels"
			buttonProps={props}
			codeExtraPadding={true}
		/>
	);
};
