"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import * as Switch from "@reloop/ui/switch";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const domainSchema = v.object({
	domain: v.pipe(
		v.string("Domain is required"),
		v.minLength(1, "Domain is required"),
		v.regex(
			/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
			"Please enter a valid domain name",
		),
	),
	customReturnPath: v.pipe(
		v.string("Custom return path is required"),
		v.minLength(1, "Custom return path is required"),
		v.regex(
			/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
			"Use only letters, numbers, and hyphens",
		),
	),
	tls: v.picklist(["opportunistic", "enforced"]),
});

type DomainFormValues = v.InferInput<typeof domainSchema>;

export const AddDomainSidebar = () => {
	const { push } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const [clickTracking, setClickTracking] = useState(false);
	const [openTracking, setOpenTracking] = useState(false);
	const { register, handleSubmit, formState, setError, setValue, watch } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			defaultValues: {
				domain: "",
				customReturnPath: "send",
				tls: "opportunistic",
			},
		});
	const tlsValue = watch("tls");

	const handleAddDomain = (domain: string) => {
		push(`/domain/add/${domain}`);
	};

	const onSubmit = async ({
		domain,
		customReturnPath,
		tls,
	}: DomainFormValues) => {
		try {
			changeStatus("loading");
			await axios.post(
				"/api/domain/v1/add",
				{
					domain,
					customReturnPath,
					clickTracking,
					openTracking,
					tls,
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(`/api/domain/v1/dns/${domain}`);
			handleAddDomain(domain);
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			setError("domain", {
				type: "manual",
				message: errorMessage,
			});
		}
	};

	return (
		<div className="mx-auto max-w-3xl pt-10 pb-8 sm:px-8">
			<AnimatedBackButton />
			<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
				<div>
					<h1 className="font-medium text-title-h5 leading-8">Add Domain</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						You need a domain to send emails from your own domain
					</p>
				</div>
			</div>

			<div className="my-6 gap-3" />
			<div className="flex gap-6">
				<form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
					<div>
						<Label.Root
							htmlFor="domain"
							className="mb-2 block font-medium text-sm"
						>
							Domain Name
							<Label.Asterisk />
						</Label.Root>
						<div className="relative">
							<Input.Root
								hasError={!!formState?.errors?.domain?.message}
								className="w-full"
							>
								<Input.Affix className="bg-bg-white-0 text-text-strong-950">
									https://
								</Input.Affix>
								<Input.Wrapper>
									<Input.Input
										id="domain"
										placeholder="www.example.com"
										{...register("domain")}
										disabled={status === "loading"}
									/>
								</Input.Wrapper>
							</Input.Root>
							{formState.errors.domain && (
								<div className="mt-2 flex items-center gap-2">
									<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
									<p className="text-red-600 text-sm">
										{formState.errors.domain.message}
									</p>
								</div>
							)}
						</div>
					</div>
					<div className="grid gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4">
						<div>
							<p className="font-medium text-sm text-text-strong-950">
								Advanced settings
							</p>
							<p className="text-paragraph-sm text-text-sub-600">
								Configure tracking, return path, and TLS for this domain.
							</p>
						</div>
						<div>
							<Label.Root
								htmlFor="customReturnPath"
								className="mb-2 block font-medium text-sm"
							>
								Custom Return Path
								<Label.Asterisk />
							</Label.Root>
							<Input.Root
								hasError={!!formState.errors.customReturnPath?.message}
								className="w-full"
							>
								<Input.Wrapper>
									<Input.Input
										id="customReturnPath"
										placeholder="send"
										{...register("customReturnPath")}
										disabled={status === "loading"}
									/>
								</Input.Wrapper>
							</Input.Root>
							<p className="mt-2 text-paragraph-xs text-text-sub-600">
								This becomes the return-path subdomain used for SPF and bounces.
							</p>
							{formState.errors.customReturnPath && (
								<div className="mt-2 flex items-center gap-2">
									<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
									<p className="text-red-600 text-sm">
										{formState.errors.customReturnPath.message}
									</p>
								</div>
							)}
						</div>
						<div>
							<Label.Root className="mb-2 block font-medium text-sm">
								TLS Mode
							</Label.Root>
							<Select.Root
								value={tlsValue}
								onValueChange={(value) =>
									setValue(
										"tls",
										value as DomainFormValues["tls"],
										{ shouldValidate: true, shouldDirty: true },
									)
								}
							>
								<Select.Trigger className="w-full">
									<Select.Value placeholder="Select TLS mode" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="opportunistic">
										Opportunistic TLS
									</Select.Item>
									<Select.Item value="enforced">Enforced TLS</Select.Item>
								</Select.Content>
							</Select.Root>
							<p className="mt-2 text-paragraph-xs text-text-sub-600">
								Enforced TLS requires a secure connection to the receiving mail
								server.
							</p>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
								<div>
									<p className="font-medium text-paragraph-sm text-text-strong-950">
										Click Tracking
									</p>
									<p className="text-paragraph-xs text-text-sub-600">
										Rewrite links to measure clicks.
									</p>
								</div>
								<Switch.Root
									checked={clickTracking}
									onCheckedChange={setClickTracking}
									disabled={status === "loading"}
									checkedColor="orange"
								/>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
								<div>
									<p className="font-medium text-paragraph-sm text-text-strong-950">
										Open Tracking
									</p>
									<p className="text-paragraph-xs text-text-sub-600">
										Measure opens using a tracking pixel.
									</p>
								</div>
								<Switch.Root
									checked={openTracking}
									onCheckedChange={setOpenTracking}
									disabled={status === "loading"}
									checkedColor="orange"
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-end">
						<Button.Root
							type="submit"
							variant="neutral"
							size="xsmall"
							disabled={status === "loading" || !formState.isValid}
							className="min-w-[140px]"
						>
							{status === "loading" ? (
								<>
									<Spinner color="currentColor" />
									Adding Domain...
								</>
							) : (
								<>
									Add Domain
									<Icon
										name="enter"
										className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
									/>
								</>
							)}
						</Button.Root>
					</div>
				</form>
				{/* Sticky Note Pro Tip */}
				<div className="relative mt-10 mb-10 w-96">
					<div className="-top-4 -translate-x-1/2 absolute left-1/2 z-10 flex flex-col items-center">
						<div className="relative h-3 w-3 rounded-full bg-gradient-to-br from-neutral-500 via-neutral-600 to-neutral-700 shadow-lg">
							<div className="absolute top-0.5 left-1 h-1.5 w-1.5 rounded-full bg-white/40" />
						</div>
						<div className="h-2 w-[2px] rounded-b-full bg-gradient-to-b from-neutral-500 via-neutral-600 to-neutral-700" />
					</div>

					<div className="relative rotate-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-5 shadow-lg transition-transform duration-300 hover:rotate-0 hover:scale-[1.02]">
						<div className="flex items-center gap-1 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
							<Icon name="bulb" className="h-3 w-3" />
							Pro Tip
						</div>
						<p className="mt-2 font-medium text-text-strong-950 text-xs leading-relaxed">
							Use separate domain for domain reputation
						</p>
						<div className="mt-3 text-text-sub-600 text-xs">
							<p>Subdomain examples:</p>
							<ul className="mt-1 space-y-0.5 pl-3">
								<li>• marketing.example.com</li>
								<li>• send.example.com</li>
								<li>• transactional.example.com</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
