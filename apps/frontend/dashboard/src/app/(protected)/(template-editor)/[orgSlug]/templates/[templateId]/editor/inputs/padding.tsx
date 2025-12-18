import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
export const InputPadding = () => {
	return (
		<div className="flex flex-col gap-1">
			<Label.Root htmlFor="password-with-level">Padding</Label.Root>
			<div className="flex gap-2">
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="padding-x" className="h-3.5 w-3.5" />
						<Input.Input type="text" placeholder="0" />
					</Input.Wrapper>
				</Input.Root>
				<Input.Root size="xsmall">
					<Input.Wrapper>
						<Input.Icon
							as={Icon}
							name="padding-x"
							className="h-3.5 w-3.5 rotate-90"
						/>
						<Input.Input type="text" placeholder="0" />
					</Input.Wrapper>
				</Input.Root>
				<Button.Root variant="neutral" size="xsmall" mode="ghost">
					<Button.Icon as={Icon} name="section-rect" />
				</Button.Root>
			</div>
		</div>
	);
};
