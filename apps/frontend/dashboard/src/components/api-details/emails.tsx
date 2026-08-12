import type * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname } from "next/navigation";
import {
	ApiDetailsDrawer,
	type ApiDetailsDrawerProps,
} from "./api-details-drawer";
import { codeExamples } from "./emails-code-examples";

const sendOperations = [
	{
		id: "send",
		label: "Send Email",
		docSlug: "post-api-mail-v1send",
	},
	{
		id: "listSent",
		label: "List Sent Emails",
		docSlug: "get-api-inbox-v1messages-sent",
	},
] as const;

const receiveOperations = [
	{
		id: "listInbound",
		label: "List Inbound Emails",
		docSlug: "get-api-inbox-v1messages",
	},
	{
		id: "getInbound",
		label: "Get Inbound Email",
		docSlug: "get-api-inbox-v1messages-by-message_id",
	},
] as const;

const languages = [
	{ id: "javascript", label: "JavaScript", shikiLang: "javascript" },
	{ id: "python", label: "Python", shikiLang: "python" },
	{ id: "php", label: "PHP", shikiLang: "php" },
	{ id: "go", label: "Go", shikiLang: "go" },
	{ id: "ruby", label: "Ruby", shikiLang: "ruby" },
	{ id: "rust", label: "Rust", shikiLang: "rust" },
	{ id: "java", label: "Java", shikiLang: "java" },
	{ id: "dotnet", label: ".NET", shikiLang: "csharp" },
	{ id: "curl", label: "cURL", shikiLang: "bash" },
] as const;

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export interface EmailsApiDetailsProps
	extends ButtonProps,
		Pick<ApiDetailsDrawerProps, "renderTrigger"> {
	isReceived?: boolean;
}

export const EmailsApiDetails = ({
	renderTrigger,
	isReceived,
	...buttonProps
}: EmailsApiDetailsProps) => {
	const pathname = usePathname();
	const activeIsReceived =
		isReceived ?? (pathname === "/receive" || pathname.startsWith("/receive/"));

	const operations = activeIsReceived ? receiveOperations : sendOperations;
	const title = activeIsReceived ? "Inbound Email API" : "Send Email API";
	const iconName = activeIsReceived ? "mail-receive" : "mail-send";

	return (
		<ApiDetailsDrawer
			title={title}
			icon={
				<Icon
					name={iconName}
					className="h-6 w-6 text-text-strong-950 dark:text-white"
				/>
			}
			hotkey="s"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="emails"
			buttonProps={buttonProps}
			codeExtraPadding={true}
			renderTrigger={renderTrigger}
		/>
	);
};
