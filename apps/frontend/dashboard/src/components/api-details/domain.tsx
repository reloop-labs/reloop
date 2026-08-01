import type * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	ApiDetailsDrawer,
	type ApiDetailsDrawerProps,
} from "./api-details-drawer";
import { codeExamples } from "./domain-code-examples";

/** Real Domain Service routes (prefix `/api/domain`). There is no `/api/domain/v1/domain`. */
const operations = [
	{
		id: "create",
		label: "Create Domain",
		method: "POST",
		endpoint: "/api/domain/v1/create",
		docSlug: "post-api-domain-v1create",
	},
	{
		id: "list",
		label: "List Domains",
		method: "GET",
		endpoint: "/api/domain/v1/list",
		docSlug: "get-api-domain-v1list",
	},
	{
		id: "get",
		label: "Get Domain",
		method: "GET",
		endpoint: "/api/domain/v1/:domain_id",
		docSlug: "get-api-domain-v1by-domain_id",
	},
	{
		id: "update",
		label: "Update Domain",
		method: "PATCH",
		endpoint: "/api/domain/v1/:domain_id",
		docSlug: "patch-api-domain-v1by-domain_id",
	},
	{
		id: "delete",
		label: "Delete Domain",
		method: "DELETE",
		endpoint: "/api/domain/v1/:domain_id",
		docSlug: "delete-api-domain-v1by-domain_id",
	},
	{
		id: "verify",
		label: "Verify DNS",
		method: "POST",
		endpoint: "/api/domain/v1/verify/:domain_id",
		docSlug: "post-api-domain-v1verify-by-domain_id",
	},
] as const;

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const DomainApiDetails = ({
	renderTrigger,
	...buttonProps
}: ButtonProps & Pick<ApiDetailsDrawerProps, "renderTrigger">) => {
	return (
		<ApiDetailsDrawer
			title="Domain API"
			icon={
				<Icon
					name="globe"
					className="h-6 w-6 text-text-strong-950 dark:text-white"
				/>
			}
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="domain"
			buttonProps={buttonProps}
			codeExtraPadding={true}
			renderTrigger={renderTrigger}
		/>
	);
};
