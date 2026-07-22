import type * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples, languages, operations } from "./api-keys-code-examples";

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button.Root>;

export const ApiKeysApiDetails = (props: ButtonProps) => {
	return (
		<ApiDetailsDrawer
			title="API Keys API"
			icon={<Icon name="key-new" className="h-6 w-6 text-text-strong-950 dark:text-white" />}
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
