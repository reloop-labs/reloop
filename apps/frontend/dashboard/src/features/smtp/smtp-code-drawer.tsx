import type * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useMemo } from "react";
import {
	ApiDetailsDrawer,
	type ApiDetailsDrawerProps,
} from "#/components/api-details/api-details-drawer";
import {
	buildSmtpCodeExamples,
	DEFAULT_SMTP_HOST,
	SMTP_LANGUAGES,
} from "./smtp-code-examples";

export const SMTP_DOCS_URL =
	"https://reloop.sh/docs/examples/smtp/introduction";

const languages = SMTP_LANGUAGES.map((l) => ({
	id: l.id,
	label: l.label,
	shikiLang: l.shikiLang,
}));

const operations = [
	{
		id: "send",
		label: "Send with SMTP",
		href: SMTP_DOCS_URL,
		icon: (
			<Icon name="mail-send" className="size-4 shrink-0 text-text-sub-600" />
		),
	},
];

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

/** Right-side code drawer for Reloop SMTP, same as the API keys "SDK" drawer. */
export function SmtpCodeDrawer({
	smtpHost = DEFAULT_SMTP_HOST,
	renderTrigger,
	...buttonProps
}: ButtonProps &
	Pick<ApiDetailsDrawerProps, "renderTrigger"> & { smtpHost?: string }) {
	const codeExamples = useMemo(() => {
		const code = buildSmtpCodeExamples("YOUR_API_KEY", smtpHost);
		return Object.fromEntries(
			SMTP_LANGUAGES.map((l) => [
				l.id,
				{ send: { filename: l.filename, code: code[l.id] } },
			]),
		);
	}, [smtpHost]);

	return (
		<ApiDetailsDrawer
			title="Send with SMTP"
			icon={
				<Icon
					name="smtp"
					className="h-6 w-6 text-text-strong-950 dark:text-white"
				/>
			}
			hotkey="s"
			languages={languages}
			operations={operations}
			codeExamples={codeExamples}
			docSection="smtp"
			buttonProps={buttonProps}
			codeExtraPadding={true}
			renderTrigger={renderTrigger}
		/>
	);
}
