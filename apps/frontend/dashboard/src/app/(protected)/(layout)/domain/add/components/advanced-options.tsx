import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { DomainFormValues } from "../schema";

interface AdvancedOptionsProps {
	register: UseFormRegister<DomainFormValues>;
	errors: FieldErrors<DomainFormValues>;
	isLoading: boolean;
}

export const AdvancedOptions = ({
	register,
	errors,
	isLoading,
}: AdvancedOptionsProps) => {
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

	return (
		<div className="pt-2">
			<button
				type="button"
				onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
				className="flex items-center gap-2 rounded-md py-2 text-text-sub-600 transition-colors hover:text-text-strong-950"
			>
				<div
					className="flex h-3 w-3 items-center justify-center"
					style={{
						transform: isAdvancedOpen ? "rotate(90deg)" : "rotate(0deg)",
					}}
				>
					<Icon name="chevron-right" className="h-full w-full" />
				</div>
				<span className="font-medium text-xs">Advanced options</span>
			</button>

			{isAdvancedOpen && (
				<section className="overflow-hidden">
					<div className="grid gap-4 pt-4 pb-2">
						<div className="grid gap-2">
							<Label.Root
								htmlFor="customReturnPath"
								className="block font-medium text-xs"
							>
								Custom Return-Path
								<Label.Asterisk />
							</Label.Root>
							<Input.Root
								hasError={!!errors.customReturnPath?.message}
								className="w-full"
								size="small"
							>
								<Input.Wrapper>
									<Input.Input
										id="customReturnPath"
										placeholder="send"
										{...register("customReturnPath")}
										disabled={isLoading}
									/>
								</Input.Wrapper>
							</Input.Root>
							<p className="text-paragraph-xs text-text-sub-600">
								This becomes the return-path subdomain used for SPF and bounces.
							</p>
							{errors.customReturnPath && (
								<div className="flex items-center gap-2">
									<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
									<p className="text-red-600 text-xs">
										{errors.customReturnPath.message}
									</p>
								</div>
							)}
						</div>
					</div>
				</section>
			)}
		</div>
	);
};
