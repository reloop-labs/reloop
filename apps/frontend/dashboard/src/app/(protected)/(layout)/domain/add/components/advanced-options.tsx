import * as Checkbox from "@reloop/ui/checkbox";
import { type Control, Controller } from "react-hook-form";
import type { DomainFormValues } from "../schema";

interface AdvancedOptionsProps {
	control: Control<DomainFormValues>;
	isLoading: boolean;
}

export const AdvancedOptions = ({
	control,
	isLoading,
}: AdvancedOptionsProps) => {
	return (
		<div className="grid grid-cols-1 gap-2 pt-4">
			<p className="font-medium text-sm">Tracking Options</p>
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
					<p className="font-medium text-xs">Enable Click Tracking</p>
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
					<p className="font-medium text-xs">Enable Open Tracking</p>
				</div>
				<p className="pl-7 text-text-sub-600 text-xs leading-relaxed">
					Open tracking can produce inaccurate results. Learn more and consider
					if open tracking is right for you.
				</p>
			</div>
		</div>
	);
};
