import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { DomainFormValues } from "../schema";
import { ProTip } from "./pro-tip";

interface DomainInputFieldProps {
	register: UseFormRegister<DomainFormValues>;
	errors: FieldErrors<DomainFormValues>;
	isLoading: boolean;
}

export const DomainInputField = ({
	register,
	errors,
	isLoading,
}: DomainInputFieldProps) => {
	return (
		<section className="space-y-1">
			<div className="space-y-1">
				<Label.Root
					htmlFor="domain"
					className="block font-medium text-sm text-text-strong-950"
				>
					Domain Name
					<Label.Asterisk />
				</Label.Root>
			</div>
			<div className="relative">
				<Input.Root
					hasError={!!errors?.domain?.message}
					className="w-full"
					size="small"
				>
					<Input.Wrapper>
						<Input.Input
							id="domain"
							placeholder="www.example.com"
							{...register("domain")}
							disabled={isLoading}
						/>
					</Input.Wrapper>
				</Input.Root>
				{errors.domain && (
					<div className="mt-2 flex items-center gap-2">
						<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
						<p className="text-red-600 text-xs">{errors.domain.message}</p>
					</div>
				)}
			</div>
		</section>
	);
};
