import * as Checkbox from "@reloop/ui/checkbox";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Tooltip from "@reloop/ui/tooltip";
import {
	type Control,
	Controller,
	type FieldErrors,
	type UseFormRegister,
} from "react-hook-form";
import type { DomainFormValues } from "../schema";

/** Fixed server defaults (must match domain service config). */
const TRACKING_SUBDOMAIN = "link";

interface AdvancedOptionsProps {
	control: Control<DomainFormValues>;
	register: UseFormRegister<DomainFormValues>;
	isLoading: boolean;
	domain?: string;
	errors?: FieldErrors<DomainFormValues>;
}

function FieldLabelWithInfo({
	htmlFor,
	label,
	tooltip,
}: {
	htmlFor: string;
	label: string;
	tooltip: string;
}) {
	return (
		<div className="flex items-center gap-1.5">
			<Label.Root
				htmlFor={htmlFor}
				className="block font-medium text-sm text-text-strong-950"
			>
				{label}
			</Label.Root>
			<Tooltip.Provider delayDuration={200}>
				<Tooltip.Root>
					<Tooltip.Trigger asChild>
						<button
							type="button"
							className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-text-sub-600 outline-none transition-colors hover:text-text-strong-950 focus-visible:ring-2 focus-visible:ring-stroke-strong-950/20"
							aria-label={`${label} info`}
						>
							<Icon name="info-outline" className="size-3.5" />
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content
						side="top"
						variant="light"
						className="max-w-xs text-balance text-xs leading-relaxed"
					>
						{tooltip}
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	);
}

function ReadonlyHostField({ id, value }: { id: string; value: string }) {
	return (
		<Input.Root className="w-full rounded-xl" size="small">
			<Input.Wrapper>
				<Input.Input
					id={id}
					value={value}
					readOnly
					aria-readonly="true"
					tabIndex={0}
					className="font-mono text-text-strong-950"
				/>
			</Input.Wrapper>
		</Input.Root>
	);
}

export const AdvancedOptions = ({
	control,
	isLoading,
	domain,
}: AdvancedOptionsProps) => {
	const domainValue = domain?.trim() ?? "";
	const hasDomain = domainValue.length > 0;
	const receivingHost = domainValue;
	const trackingHost = hasDomain ? `${TRACKING_SUBDOMAIN}.${domainValue}` : "";

	const receivingTooltip = hasDomain
		? `Send and receive on the same domain (e.g. hello@${receivingHost}). MX points to inbound.reloop.sh. Managed by Reloop — not configurable.`
		: "";
	const trackingTooltip = hasDomain
		? `Always ${TRACKING_SUBDOMAIN}.{domain}, CNAME to link.reloop.sh. Managed by Reloop — not configurable.`
		: "";

	return (
		<div className="grid grid-cols-1 gap-4">
			{hasDomain && (
				<>
					<div className="space-y-1.5">
						<FieldLabelWithInfo
							htmlFor="receivingDomain"
							label="Receiving domain"
							tooltip={receivingTooltip}
						/>
						<ReadonlyHostField id="receivingDomain" value={receivingHost} />
					</div>

					<div className="space-y-1.5">
						<FieldLabelWithInfo
							htmlFor="trackingSubdomain"
							label="Tracking subdomain"
							tooltip={trackingTooltip}
						/>
						<ReadonlyHostField id="trackingSubdomain" value={trackingHost} />
					</div>
				</>
			)}

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
};
