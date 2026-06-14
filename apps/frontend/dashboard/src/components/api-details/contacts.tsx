import type * as Button from "@reloop/ui/button";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./contacts-code-examples";

const operations = [
	{ id: "add", label: "Add Contact", docSlug: "post-api-contacts-create" },
	{
		id: "get",
		label: "Get Contact",
		docSlug: "get-api-contacts-retrieve-by-contact_id",
	},
	{ id: "list", label: "List Contacts", docSlug: "get-api-contacts-list" },
	{
		id: "update",
		label: "Update Contact",
		docSlug: "patch-api-contacts-by-contact_id",
	},
	{
		id: "delete",
		label: "Delete Contact",
		docSlug: "delete-api-contacts-by-contact_id",
	},
	{
		id: "addChannel",
		label: "Add Contact Channel",
		docSlug: "post-api-contacts-channel-by-channel_id",
	},
	{
		id: "updateChannel",
		label: "Update Contact Channel",
		docSlug: "patch-api-contacts-channel-by-channel_id",
	},
	{
		id: "addGroup",
		label: "Add Contact Group",
		docSlug: "post-api-contacts-group-by-group_id",
	},
	{
		id: "deleteGroup",
		label: "Delete Contact Group",
		docSlug: "delete-api-contacts-group-by-group_id",
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

export const ContactsApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="Contacts API"
			description="Manage contacts programmatically with our REST API"
			hotkey="a"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="contacts"
			buttonProps={props}
			codeExtraPadding={true}
		/>
	);
};
