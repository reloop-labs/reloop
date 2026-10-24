import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import type { UseFormReturn } from "react-hook-form";
import {
	ApiKeyAccessField,
	type ApiKeyAccessValue,
} from "../../access/api-key-access-field";

export type ApiKeyFormValues = {
	name: string;
};

export function FormStep({
	form,
	isLoading,
	access,
	onAccessChange,
}: {
	form: UseFormReturn<ApiKeyFormValues>;
	isLoading: boolean;
	access: ApiKeyAccessValue;
	onAccessChange: (value: ApiKeyAccessValue) => void;
}) {
	const {
		register,
		formState: { errors },
	} = form;

	return (
		<div className="space-y-5">
			<div className="space-y-1.5">
				<Label.Root
					htmlFor="name"
					className="font-medium text-text-strong-950 text-xs dark:text-white"
				>
					API key name
					<Label.Asterisk />
				</Label.Root>
				<Input.Root size="medium" hasError={!!errors.name}>
					<Input.Wrapper>
						<Input.Input
							id="name"
							placeholder="e.g. Production Server"
							autoFocus
							{...register("name")}
							disabled={isLoading}
						/>
					</Input.Wrapper>
				</Input.Root>
				{errors.name ? (
					<p className="text-error-base text-xs">{errors.name.message}</p>
				) : (
					<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
						Used to identify this key in your dashboard.
					</p>
				)}
			</div>
			<ApiKeyAccessField
				value={access}
				onChange={onAccessChange}
				disabled={isLoading}
			/>
		</div>
	);
}
