import type * as Button from "@reloop/ui/button";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples } from "./domain-code-examples";

const operations = [
	{
		id: "add",
		label: "Add Domain",
		method: "POST",
		endpoint: "/api/v1/add",
		docSlug: "post-api-v1-add",
	},
	{
		id: "list",
		label: "List Domains",
		method: "GET",
		endpoint: "/api/v1/list",
		docSlug: "get-api-v1-list",
	},
	{
		id: "details",
		label: "Get Details",
		method: "GET",
		endpoint: "/api/v1/details",
		docSlug: "get-api-v1-details",
	},
	{
		id: "delete",
		label: "Delete Domain",
		method: "DELETE",
		endpoint: "/api/v1/delete",
		docSlug: "delete-api-v1-delete",
	},
] as const;

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const DomainApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="Domain API"
			description="Manage domains programmatically with our REST API"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="domain"
			buttonProps={props}
			codeExtraPadding={true}
		/>
	);
};
