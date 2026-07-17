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

/** Fixed server defaults (must match domain service config). */
const TRACKING_SUBDOMAIN = "link";

export function AdvancedOptions({
	control,
	isLoading,
	domain,
}: {
	control: Control<DomainFormValues>;
	register: UseFormRegister<DomainFormValues>;
	isLoading: boolean;
	domain?: string;
	errors?: FieldErrors<DomainFormValues>;
}) {
	const receivingHost = domain?.trim() || "your-domain.com";
	const trackingHost = domain?.trim()
		? `${TRACKING_SUBDOMAIN}.${domain.trim()}`
		: `${TRACKING_SUBDOMAIN}.your-domain.com`;

	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="space-y-1">
				<Label.Root
					htmlFor="receivingDomain"
					className="block font-medium text-sm text-text-strong-950"
				>
					Receiving domain
				</Label.Root>
				<Input.Root className="w-full rounded-xl" size="small">
					<Input.Wrapper>
						<Input.Input
							id="receivingDomain"
							value={receivingHost}
							readOnly
							disabled
							aria-readonly="true"
						/>
					</Input.Wrapper>
				</Input.Root>
				<p className="text-text-sub-600 text-xs leading-relaxed">
					Send and receive on the same domain (e.g.{" "}
					<span className="font-medium text-text-strong-950">
						hello@{receivingHost}
					</span>
					). MX points to{" "}
					<span className="font-mono text-text-strong-950">
						inbound.reloop.sh
					</span>
					. Managed by Reloop — not configurable.
				</p>
			</div>

			<div className="space-y-1">
				<Label.Root
					htmlFor="trackingSubdomain"
					className="block font-medium text-sm text-text-strong-950"
				>
					Tracking subdomain
				</Label.Root>
				<Input.Root className="w-full rounded-xl" size="small">
					<Input.Wrapper>
						<Input.Input
							id="trackingSubdomain"
							value={trackingHost}
							readOnly
							disabled
							aria-readonly="true"
						/>
					</Input.Wrapper>
				</Input.Root>
				<p className="text-text-sub-600 text-xs leading-relaxed">
					Always{" "}
					<span className="font-mono text-text-strong-950">
						{TRACKING_SUBDOMAIN}.{"{domain}"}
					</span>
					, CNAME to{" "}
					<span className="font-mono text-text-strong-950">
						link.reloop.sh
					</span>
					. Managed by Reloop — not configurable.
				</p>
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
