import type * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./properties-code-examples";

const operations = [
	{
		id: "add",
		label: "Create Property",
		docSlug: "post-api-contacts-v1properties-create",
	},
	{
		id: "list",
		label: "List Properties",
		docSlug: "get-api-contacts-v1properties-list",
	},
	{
		id: "update",
		label: "Update Property",
		docSlug: "patch-api-contacts-v1properties-by-contact_property_id",
	},
	{
		id: "delete",
		label: "Delete Property",
		docSlug: "delete-api-contacts-v1properties-by-contact_property_id",
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

export const PropertiesApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="Properties API"
			icon={<Icon name="tag" className="h-6 w-6 text-text-strong-950 dark:text-white" />}
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="contacts/contact-properties"
			buttonProps={props}
			codeExtraPadding={true}
		/>
	);
};
