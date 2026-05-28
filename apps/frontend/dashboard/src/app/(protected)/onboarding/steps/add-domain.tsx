"use client";

import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Accordion from "@reloop/ui/accordion";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { AdvancedOptions } from "./add-domain/components/advanced-options";
import { DomainInputField } from "./add-domain/components/domain-input-field";
import { type DomainFormValues, domainSchema } from "./add-domain/schema";

export const AddDomainStep = () => {
	const [domain, setDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [, setDomainId] = useQueryState(
		"domainId",
		parseAsString.withDefault(""),
	);
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [, setSkippedDns] = useQueryState(
		"skippedDns",
		parseAsString.withDefault(""),
	);
	const [status, setStatus] = React.useState<"idle" | "loading">("idle");
	const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);

	const { register, handleSubmit, formState, setError, watch, control } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			defaultValues: {
				domain: domain || "",
				clickTracking: false,
				openTracking: false,
				customReturnPath: "recive",
				trackingSubdomain: "links",
			},
		});

	const watchedDomain = watch("domain");

	// Sync form domain to nuqs for preview
	React.useEffect(() => {
		setDomain(watchedDomain || null);
	}, [watchedDomain, setDomain]);

	const onSubmit = async (values: DomainFormValues) => {
		try {
			setStatus("loading");
			const { data } = await axios.post<DomainResponse>(
				"/api/domain/v1/create",
				{
					domain: values.domain,
					click_tracking: values.clickTracking,
					open_tracking: values.openTracking,
					custom_return_path: values.customReturnPath,
					tracking: values.trackingSubdomain,
					tls: "opportunistic",
				},
				{ headers: { credentials: "include" } },
			);
			setDomainId(data.id);
			setStep(step + 1);
		} catch (error) {
			setStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";

			setError("domain", {
				type: "manual",
				message: errorMessage,
			});
			toast.error(errorMessage);
		}
	};

	useHotkeys(
		"mod+enter",
		() => {
			if (status !== "loading") {
				handleSubmit(onSubmit)();
			}
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		"a+l",
		() => {
			if (status !== "loading") {
				setSkippedDns("true");
				setStep(4);
			}
		},
		{ enableOnFormTags: true },
	);

	return (
		<div className="space-y-6">
			<form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col">
				<DomainInputField
					register={register}
					errors={formState.errors}
					isLoading={status === "loading"}
					domain={watchedDomain}
				/>

				<div className="mt-2 w-full">
					<button
						type="button"
						onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
						className="flex w-full cursor-pointer items-center gap-2 py-1 outline-none"
					>
						<span className="font-medium text-sm text-text-strong-950">
							Advanced options
						</span>
						<Icon
							name="chevron-down"
							className={cn(
								"size-4 shrink-0 text-text-sub-600 transition-transform duration-200",
								isAdvancedOpen && "rotate-180",
							)}
						/>
					</button>
					{isAdvancedOpen && (
						<div className="mt-2 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4">
							<AdvancedOptions
								control={control}
								register={register}
								domain={watchedDomain}
								isLoading={status === "loading"}
							/>
						</div>
					)}
				</div>

				<div className="mt-5 flex items-center gap-3">
					<Button.Root
						type="submit"
						variant="neutral"
						mode="filled"
						size="xsmall"
						disabled={status === "loading"}
					>
						{status === "loading" ? (
							<>
								<Spinner color="currentColor" />
								Adding Domain...
							</>
						) : (
							<>
								Add Domain
								<span className="inline-flex items-center gap-0.5">
									<Icon
										name="command"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
									<Icon
										name="enter"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
								</span>
							</>
						)}
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => {
							setSkippedDns("true");
							setStep(4);
						}}
						disabled={status === "loading"}
					>
						Add Later
						<span className="inline-flex items-center gap-0.5">
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
								A
							</span>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
								L
							</span>
						</span>
					</Button.Root>
				</div>
			</form>
		</div>
	);
};
