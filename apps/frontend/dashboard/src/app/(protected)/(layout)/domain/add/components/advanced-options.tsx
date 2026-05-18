import * as Checkbox from "@reloop/ui/checkbox";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { type Control, Controller, type UseFormRegister } from "react-hook-form";
import type { DomainFormValues } from "../schema";

interface AdvancedOptionsProps {
	control: Control<DomainFormValues>;
	register: UseFormRegister<DomainFormValues>;
	isLoading: boolean;
}

export const AdvancedOptions = ({
	control,
	register,
	isLoading,
}: AdvancedOptionsProps) => {
	return (
		<div className="grid grid-cols-1 gap-4 pt-4">
			<div className="space-y-1">
				<Label.Root
					htmlFor="customReturnPath"
					className="block font-medium text-sm text-text-strong-950"
				>
					Custom Return-Path
				</Label.Root>
				<Input.Root className="w-full" size="small">
					<Input.Wrapper>
						<Input.Input
							id="customReturnPath"
							placeholder="send"
							{...register("customReturnPath")}
							disabled={isLoading}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div className="space-y-1">
				<Label.Root
					htmlFor="trackingSubdomain"
					className="block font-medium text-sm text-text-strong-950"
				>
					Tracking Subdomain
				</Label.Root>
				<Input.Root className="w-full" size="small">
					<Input.Wrapper>
						<Input.Input
							id="trackingSubdomain"
							placeholder="links"
							{...register("trackingSubdomain")}
							disabled={isLoading}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>

			<div className="space-y-2">
				<p className="font-medium text-sm">Tracking options</p>
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Controller
							name="clickTracking"
							control={control}
							render={({ field }) => (
								<Checkbox.Root
									variant="black"
									checked={field.value}
									onCheckedChange={field.onChange}
									disabled={isLoading}
								/>
							)}
						/>
						<p className="font-medium text-xs">Enable click tracking</p>
					</div>
				</div>
				<div className="flex flex-col">
					<div className="flex w-full items-center gap-2">
						<Controller
							name="openTracking"
							control={control}
							render={({ field }) => (
								<Checkbox.Root
									variant="black"
									checked={field.value}
									onCheckedChange={field.onChange}
									disabled={isLoading}
								/>
							)}
						/>
						<p className="font-medium text-xs">Enable open tracking</p>
					</div>
					<p className="pl-7 text-text-sub-600 text-xs leading-relaxed">
						Open tracking can produce inaccurate results. Learn more and consider
						if open tracking is right for you.
					</p>
				</div>
			</div>
		</div>
	);
};
