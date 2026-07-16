import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as React from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { DomainFormValues } from "./schema";

const DOMAIN_REGEX =
	/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function DomainInputField({
	register,
	errors,
	isLoading,
	domain,
}: {
	register: UseFormRegister<DomainFormValues>;
	errors: FieldErrors<DomainFormValues>;
	isLoading: boolean;
	domain?: string;
}) {
	const domainParts = React.useMemo(() => {
		if (!domain) return [];
		return domain.split(".").filter(Boolean);
	}, [domain]);

	const criteria = React.useMemo(() => {
		if (!domain) {
			return { isSubdomain: false, isNotRoot: false, isValid: false };
		}
		const isValid = DOMAIN_REGEX.test(domain);
		return {
			isSubdomain: isValid && domainParts.length > 2,
			isNotRoot: isValid && domainParts.length > 2,
			isValid,
		};
	}, [domain, domainParts]);

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
					className="w-full rounded-xl"
					size="small"
				>
					<Input.Wrapper>
						<Input.Input
							id="domain"
							placeholder="send.example.com"
							{...register("domain")}
							disabled={isLoading}
						/>

						{criteria.isSubdomain && (
							<Input.Icon>
								<Icon name="check-circle" className="h-4 w-4 text-green-500" />
							</Input.Icon>
						)}

						{!criteria.isSubdomain && domainParts.length > 0 && (
							<Input.Icon>
								<Icon
									name="alert-triangle"
									className="h-4 w-4 text-orange-500"
								/>
							</Input.Icon>
						)}
					</Input.Wrapper>
				</Input.Root>

				{domainParts.length === 2 && (
					<div className="mt-2 space-y-2">
						<div className="font-medium text-text-sub-600 text-xs">
							Domain Recommendations:
						</div>
						<div className="space-y-1.5">
							<div className="flex items-center gap-2 text-text-sub-600 text-xs">
								{criteria.isSubdomain ? (
									<Icon
										name="check-circle"
										className="h-4 w-4 text-green-500"
									/>
								) : (
									<Icon
										name="cross-circle"
										className="h-4 w-4 text-text-soft-400"
									/>
								)}
								Use a subdomain (e.g., mail.{domain}, send.{domain}, m.
								{domain})
							</div>
							<div className="flex items-center gap-2 text-text-sub-600 text-xs">
								{criteria.isNotRoot ? (
									<Icon
										name="check-circle"
										className="h-4 w-4 text-green-500"
									/>
								) : (
									<Icon
										name="cross-circle"
										className="h-4 w-4 text-text-soft-400"
									/>
								)}
								Avoid using your root domain
							</div>
							<div className="flex items-center gap-2 text-text-sub-600 text-xs">
								{criteria.isValid ? (
									<Icon
										name="check-circle"
										className="h-4 w-4 text-green-500"
									/>
								) : (
									<Icon
										name="cross-circle"
										className="h-4 w-4 text-text-soft-400"
									/>
								)}
								Valid domain format
							</div>
						</div>
					</div>
				)}

				{errors.domain && (
					<div className="mt-2 flex items-center gap-2">
						<Icon name="alert-circle" className="h-4 w-4 text-error-base" />
						<p className="text-error-base text-xs">{errors.domain.message}</p>
					</div>
				)}
			</div>
		</section>
	);
}
