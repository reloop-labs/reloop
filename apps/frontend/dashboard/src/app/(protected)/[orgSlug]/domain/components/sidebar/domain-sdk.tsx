import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
export const DomainSDK = () => {
	return (
		<div>
			<Button.Root variant="neutral" size="xsmall" mode="stroke">
				<Icon name="code" className="h-4 w-4" />
				API <Kbd.Root>P</Kbd.Root>
			</Button.Root>
		</div>
	);
};
