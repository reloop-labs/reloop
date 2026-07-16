import type * as Button from "@reloop/ui/button";
import { ApiDetailsDrawer } from "./api-details-drawer";
import { codeExamples, languages, operations } from "./api-keys-code-examples";

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
