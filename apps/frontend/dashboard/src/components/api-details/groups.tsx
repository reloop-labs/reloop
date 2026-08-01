import type * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	ApiDetailsDrawer,
	type ApiDetailsDrawerProps,
} from "./api-details-drawer";
import { codeExamples } from "./groups-code-examples";

const operations = [
	{
		id: "add",
		label: "Create Group",
		docSlug: "post-api-contacts-v1groups-create",
	},
	{
		id: "get",
		label: "Retrieve Group",
		docSlug: "get-api-contacts-v1groups-by-group_id",
	},
	{
		id: "list",
		label: "List Groups",
		docSlug: "get-api-contacts-v1groups-list",
	},
	{
		id: "update",
		label: "Update Group",
		docSlug: "patch-api-contacts-v1groups-by-group_id",
	},
	{
		id: "delete",
		label: "Delete Group",
		docSlug: "delete-api-contacts-v1groups-by-group_id",
	},
	{
		id: "getContacts",
		label: "Get Group Contacts",
		docSlug: "get-api-contacts-v1groups-by-group_id-contacts",
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

export const GroupsApiDetails = ({
	renderTrigger,
	...buttonProps
}: ButtonProps & Pick<ApiDetailsDrawerProps, "renderTrigger">) => {
	return (
		<ApiDetailsDrawer
			title="Groups API"
			icon={
				<Icon
					name="modules"
					className="h-6 w-6 text-text-strong-950 dark:text-white"
				/>
			}
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="contacts/groups"
			buttonProps={buttonProps}
			codeExtraPadding={true}
			renderTrigger={renderTrigger}
		/>
	);
};
