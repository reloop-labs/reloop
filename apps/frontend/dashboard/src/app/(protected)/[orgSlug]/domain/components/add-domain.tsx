"use client";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { DomainPreview } from "@fe/dashboard/app/(protected)/onboarding/components/previews";
import { valibotResolver } from "@hookform/resolvers/valibot";
import type { DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Switch from "@reloop/ui/switch";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRef, useState } from "react";
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

const tlsOptions = [
	{ value: "opportunistic", label: "Opportunistic TLS" },
	{ value: "enforced", label: "Enforced TLS" },
] as const;

export const AddDomainSidebar = () => {
	const { push } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const [clickTracking, setClickTracking] = useState(false);
	const [openTracking, setOpenTracking] = useState(false);
	const [tlsOpen, setTlsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
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
	const currentTlsOption =
		tlsOptions.find((option) => option.value === tlsValue) ?? tlsOptions[0];
	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const handleAddDomain = (domainId: string) => {
		push(`/domain/add/${domainId}`);
	};

	const onSubmit = async ({
		domain,
		customReturnPath,
		tls,
	}: DomainFormValues) => {
		try {
			changeStatus("loading");
			const { data } = await axios.post<DomainResponse>(
				"/api/domain/v1/create",
				{
					domain,
					customReturnPath,
					clickTracking,
					openTracking,
					tls,
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(
				(key) => typeof key === "string" && key.startsWith("/api/domain/v1/list"),
			);
			await mutate(`/api/domain/v1/${data.id}`, data, false);
			handleAddDomain(data.id);
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
		<div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
			<div
				className="scrollbar-hide flex w-full flex-col overflow-y-auto lg:w-1/2"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				<div className="mx-auto w-full max-w-2xl px-6 pt-8 pb-10 sm:px-12">
					<AnimatedBackButton />
					<div className="mb-4 border-stroke-soft-200 border-b border-dashed pt-4 pb-4">
						<div>
							<h1 className="font-medium text-title-h5 leading-8">
								Add Domain
							</h1>
							<p className="text-paragraph-sm text-text-sub-600">
								You need a domain to send emails from your own domain
							</p>
						</div>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
						<section className="space-y-3">
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
									hasError={!!formState?.errors?.domain?.message}
									className="w-full"
									size="small"
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
							<div className="max-w-[720px] rounded-xl bg-bg-weak-50/60 px-4 py-2">
								<div className="flex items-start gap-3">
									<div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-bg-white-0 text-text-soft-400 shadow-regular-xs">
										<Icon name="bulb" className="h-3.5 w-3.5" />
									</div>
									<div className="space-y-0.5">
										<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-[0.18em]">
											Pro Tip
										</p>
										<p className="max-w-[560px] text-[13px] leading-5 text-text-sub-600">
											Use a sending domain or dedicated subdomain you control.
										</p>
										<p className="max-w-[560px] text-[13px] leading-5 text-text-sub-600">
											Examples: marketing.example.com or send.example.com.
										</p>
									</div>
								</div>
							</div>
						</section>

						<section className="border-stroke-soft-200 border-t pt-4">
							<div className="space-y-0.5">
								<h2 className="font-medium text-lg text-text-strong-950">
									Advanced settings
								</h2>
								<p className="max-w-xl text-[13px] leading-5 text-text-sub-600">
									Configure return path, TLS, and tracking before you add the
									domain.
								</p>
							</div>

							<div className="grid gap-4 pt-4">
								<div className="grid gap-2">
									<Label.Root
										htmlFor="customReturnPath"
										className="block font-medium text-sm"
									>
										Custom Return Path
										<Label.Asterisk />
									</Label.Root>
									<Input.Root
										hasError={!!formState.errors.customReturnPath?.message}
										className="w-full"
										size="small"
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
									<p className="text-paragraph-xs text-text-sub-600">
										This becomes the return-path subdomain used for SPF and
										bounces.
									</p>
									{formState.errors.customReturnPath && (
										<div className="flex items-center gap-2">
											<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
											<p className="text-red-600 text-sm">
												{formState.errors.customReturnPath.message}
											</p>
										</div>
									)}
								</div>

								<div className="grid gap-2">
									<Label.Root className="block font-medium text-sm">
										TLS Mode
									</Label.Root>
									<Dropdown.Root open={tlsOpen} onOpenChange={setTlsOpen}>
										<Dropdown.Trigger asChild>
											<button
												type="button"
												className="group/trigger flex h-9 min-h-9 w-full items-center gap-2 rounded-lg bg-bg-white-0 pl-2.5 pr-2 text-left text-paragraph-sm text-text-strong-950 outline-none ring-1 ring-inset ring-stroke-soft-100 transition duration-200 ease-out hover:bg-bg-weak-50 hover:ring-transparent focus:shadow-button-important-focus focus:outline-none focus:ring-stroke-strong-950"
											>
												<span>{currentTlsOption.label}</span>
												<Icon
													name="chevron-down"
													className={cn(
														"ml-auto size-5 shrink-0 text-text-sub-600 transition duration-200 ease-out",
														tlsOpen && "rotate-180",
													)}
												/>
											</button>
										</Dropdown.Trigger>
										<Dropdown.Content align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-2">
											<div className="relative">
												{tlsOptions.map((option, idx) => {
													const isSelected = tlsValue === option.value;
													return (
														<button
															key={option.value}
															ref={(el) => {
																if (el) buttonRefs.current[idx] = el;
															}}
															type="button"
															onPointerEnter={() => setHoverIdx(idx)}
															onPointerLeave={() => setHoverIdx(undefined)}
															onClick={() => {
																setValue(
																	"tls",
																	option.value as DomainFormValues["tls"],
																	{
																		shouldValidate: true,
																		shouldDirty: true,
																	},
																);
																setTlsOpen(false);
															}}
															className={cn(
																"flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-text-strong-950 transition-colors",
																!currentRect &&
																	hoverIdx === idx &&
																	"bg-neutral-alpha-10",
															)}
														>
															<span>{option.label}</span>
															{isSelected && (
																<Icon
																	name="check"
																	className="ml-auto h-4 w-4 text-text-sub-600"
																/>
															)}
														</button>
													);
												})}
												<AnimatedHoverBackground
													rect={currentRect}
													tabElement={currentTab}
												/>
											</div>
										</Dropdown.Content>
									</Dropdown.Root>
									<p className="text-paragraph-xs text-text-sub-600">
										Enforced TLS requires a secure connection to the receiving
										mail server.
									</p>
								</div>

								<div className="grid gap-2.5 sm:grid-cols-2">
									<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
										<div className="flex items-start justify-between gap-4">
											<div className="space-y-1">
												<p className="font-medium text-paragraph-sm text-text-strong-950">
													Click Tracking
												</p>
												<p className="max-w-[220px] text-paragraph-xs text-text-sub-600">
													Rewrite links to measure clicks.
												</p>
											</div>
											<Switch.Root
												checked={clickTracking}
												onCheckedChange={setClickTracking}
												disabled={status === "loading"}
											/>
										</div>
									</div>
									<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
										<div className="flex items-start justify-between gap-4">
											<div className="space-y-1">
												<p className="font-medium text-paragraph-sm text-text-strong-950">
													Open Tracking
												</p>
												<p className="max-w-[220px] text-paragraph-xs text-text-sub-600">
													Measure opens using a tracking pixel.
												</p>
											</div>
											<Switch.Root
												checked={openTracking}
												onCheckedChange={setOpenTracking}
												disabled={status === "loading"}
											/>
										</div>
									</div>
								</div>
							</div>
						</section>

						<div className="flex justify-end pt-1">
							<Button.Root
								type="submit"
								variant="neutral"
								mode="filled"
								disabled={status === "loading" || !formState.isValid}
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
				</div>
			</div>
			
			{/* Right side preview */}
			<div className="relative hidden h-full w-1/2 shrink-0 overflow-hidden bg-bg-weak-50/10 lg:flex">
				<div className="fade-in slide-in-from-bottom-8 relative z-10 h-full w-full animate-in duration-700">
					<div className="flex h-full items-start justify-center px-8 pt-6 pb-10">
						<DomainPreview domain={watch("domain")} variant="domain" />
					</div>
				</div>
			</div>
		</div>
	);
};
