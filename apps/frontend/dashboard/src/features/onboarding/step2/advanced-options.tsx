import * as Checkbox from "@reloop/ui/checkbox";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import {
	type Control,
	Controller,
	type FieldErrors,
	type UseFormRegister,
} from "react-hook-form";
import type { DomainFormValues } from "./schema";

export function AdvancedOptions({
	control,
	register,
	isLoading,
	domain,
	errors,
}: {
	control: Control<DomainFormValues>;
	register: UseFormRegister<DomainFormValues>;
	isLoading: boolean;
	domain?: string;
	errors?: FieldErrors<DomainFormValues>;
}) {
	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="space-y-1">
				<Label.Root
					htmlFor="customReturnPath"
					className="block font-medium text-sm text-text-strong-950"
				>
					Receiving email path
				</Label.Root>
				<Input.Root
					hasError={!!errors?.customReturnPath}
					className="w-full rounded-xl"
					size="small"
				>
					<Input.Wrapper>
						<Input.Input
							id="customReturnPath"
							placeholder="receive"
							{...register("customReturnPath")}
							disabled={isLoading}
						/>
						{domain && (
							<span className="flex items-center pr-3 font-medium text-text-sub-600 text-xs">
								.{domain}
							</span>
						)}
					</Input.Wrapper>
				</Input.Root>
				{errors?.customReturnPath?.message && (
					<p className="text-error-base text-xs">
						{errors.customReturnPath.message}
					</p>
				)}
			</div>

			<div className="space-y-1">
				<Label.Root
					htmlFor="trackingSubdomain"
					className="block font-medium text-sm text-text-strong-950"
				>
					Tracking Subdomain
				</Label.Root>
				<Input.Root
					hasError={!!errors?.trackingSubdomain}
					className="w-full rounded-xl"
					size="small"
				>
					<Input.Wrapper>
						<Input.Input
							id="trackingSubdomain"
							placeholder="link"
							{...register("trackingSubdomain")}
							disabled={isLoading}
						/>
						{domain && (
							<span className="flex items-center pr-3 font-medium text-text-sub-600 text-xs">
								.{domain}
							</span>
						)}
					</Input.Wrapper>
				</Input.Root>
				{errors?.trackingSubdomain?.message && (
					<p className="text-error-base text-xs">
						{errors.trackingSubdomain.message}
					</p>
				)}
			</div>

			<div className="space-y-3">
				<p className="font-medium text-sm text-text-strong-950">
					Tracking options
				</p>
				<div className="flex flex-col gap-4">
					<label
						htmlFor="clickTracking"
						className="flex cursor-pointer select-none items-start gap-2.5"
					>
						<Controller
							name="clickTracking"
							control={control}
							render={({ field }) => (
								<Checkbox.Root
									id="clickTracking"
									variant="black"
									checked={field.value}
									onCheckedChange={field.onChange}
									disabled={isLoading}
									className="mt-0.5"
								/>
							)}
						/>
						<div className="mt-1 flex flex-col gap-0.5">
							<span className="font-medium text-text-strong-950 text-xs">
								Enable click tracking
							</span>
							<span className="text-text-sub-600 text-xs leading-relaxed">
								Click tracking rewrites links in your emails to track when
								recipients click them.
							</span>
						</div>
					</label>

					<label
						htmlFor="openTracking"
						className="flex cursor-pointer select-none items-start gap-2.5"
					>
						<Controller
							name="openTracking"
							control={control}
							render={({ field }) => (
								<Checkbox.Root
									id="openTracking"
									variant="black"
									checked={field.value}
									onCheckedChange={field.onChange}
									disabled={isLoading}
									className="mt-0.5"
								/>
							)}
						/>
						<div className="mt-1 flex flex-col gap-0.5">
							<span className="font-medium text-text-strong-950 text-xs">
								Enable open tracking
							</span>
							<span className="text-text-sub-600 text-xs leading-relaxed">
								Open tracking can produce inaccurate results. Learn more and
								consider if open tracking is right for you.
							</span>
						</div>
					</label>
				</div>
			</div>
		</div>
	);
}
