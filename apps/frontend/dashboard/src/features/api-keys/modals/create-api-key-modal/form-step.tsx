import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import type { UseFormReturn } from "react-hook-form";

export type ApiKeyFormValues = {
	name: string;
};

export function FormStep({
	form,
	isLoading,
}: {
	form: UseFormReturn<ApiKeyFormValues>;
	isLoading: boolean;
}) {
	const {
		register,
		formState: { errors },
	} = form;

	return (
		<div className="mt-5 space-y-2">
			<Label.Root htmlFor="name">
				Name
				<Label.Asterisk />
			</Label.Root>
			<Input.Root size="medium" hasError={!!errors.name}>
				<Input.Wrapper>
					<Input.Input
						id="name"
						placeholder="e.g., Production Server, My App"
						autoFocus
						{...register("name")}
						disabled={isLoading}
					/>
				</Input.Wrapper>
			</Input.Root>
			{errors.name ? (
				<p className="text-error-base text-paragraph-xs">
					{errors.name.message}
				</p>
			) : (
				<p className="text-paragraph-xs text-text-sub-600">
					Provide a descriptive name to help you identify this key later.
				</p>
			)}
		</div>
	);
}
