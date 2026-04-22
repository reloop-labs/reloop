"use client";
import { DomainPreview } from "@fe/dashboard/app/(protected)/(with-layout)/onboarding/components/previews";
import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import { valibotResolver } from "@hookform/resolvers/valibot";
import type { DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
});

type DomainFormValues = v.InferInput<typeof domainSchema>;

export const AddDomainSidebar = () => {
	const router = useRouter();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const didAutoScrollRef = useRef(false);
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
	const { register, handleSubmit, formState, setError, watch } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			defaultValues: {
				domain: "",
				customReturnPath: "send",
			},
		});
	const domainValue = watch("domain");
	const hasDomainValue = domainValue.trim().length > 0;
	const matchedRevealTransition = {
		duration: 0.55,
		ease: "easeInOut" as const,
	};

	useEffect(() => {
		if (!hasDomainValue) {
			didAutoScrollRef.current = false;
			return;
		}

		if (didAutoScrollRef.current) {
			return;
		}

		const timer = window.setTimeout(() => {
			const scrollContainer = scrollContainerRef.current;

			if (!scrollContainer) {
				return;
			}

			const startTop = scrollContainer.scrollTop;
			const getTargetTop = () =>
				Math.max(
					scrollContainer.scrollHeight - scrollContainer.clientHeight,
					0,
				);
			const durationMs = matchedRevealTransition.duration * 1000;
			const startTime = performance.now();

			const easeInOut = (t: number) =>
				t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

			const animateScroll = (now: number) => {
				const elapsed = now - startTime;
				const progress = Math.min(elapsed / durationMs, 1);
				const targetTop = getTargetTop();
				const distance = targetTop - startTop;
				scrollContainer.scrollTop = startTop + distance * easeInOut(progress);

				if (progress < 1) {
					window.requestAnimationFrame(animateScroll);
				}
			};

			window.requestAnimationFrame(animateScroll);

			didAutoScrollRef.current = true;
		}, 260);

		return () => window.clearTimeout(timer);
	}, [hasDomainValue]);

	const handleAddDomain = (domainId: string) => {
		router.push(`/domain/add/${domainId}`);
	};

	const onSubmit = async ({ domain, customReturnPath }: DomainFormValues) => {
		try {
			changeStatus("loading");
			const { data } = await axios.post<DomainResponse>(
				"/api/domain/v1/create",
				{
					domain,
					customReturnPath,
					clickTracking: false,
					openTracking: false,
					tls: "opportunistic",
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(
				(key) =>
					typeof key === "string" && key.startsWith("/api/domain/v1/list"),
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
		<div className="h-[calc(100vh-64px)] w-full overflow-hidden">
			<div className="relative mx-auto flex h-full w-full max-w-3xl overflow-hidden">
				<div className="pointer-events-none absolute top-[143px] left-1 z-20 w-full border-stroke-soft-200 border-b border-dashed" />
				<div
					ref={scrollContainerRef}
					className="scrollbar-hide flex w-full flex-col overflow-y-auto lg:w-1/2 lg:shrink-0"
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					<div className="mx-auto w-full px-2 pt-8 pb-10">
						<AnimatedBackButton />
						<div className="pt-4 pb-4">
							<div>
								<h1 className="font-semibold text-title-h6 leading-8">
									Add Domain
								</h1>
								<p className="text-text-sub-600 text-xs">
									Send emails from a domain you control
								</p>
							</div>
						</div>
						<div className="mb-6 h-[1px]" />

						<motion.form
							layout
							onSubmit={handleSubmit(onSubmit)}
							className="flex w-full flex-col gap-3"
							transition={{ layout: matchedRevealTransition }}
						>
							<motion.section layout="position" className="space-y-3">
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
											<Icon
												name="alert-circle"
												className="h-4 w-4 text-red-500"
											/>
											<p className="text-red-600 text-xs">
												{formState.errors.domain.message}
											</p>
										</div>
									)}
								</div>
								<div className="max-w-[720px] rounded-xl bg-bg-weak-50/60 px-4 py-2">
									<div className="flex items-center gap-3">
										<div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-bg-white-0 text-text-soft-400 shadow-regular-xs">
											<Icon name="bulb" className="h-3.5 w-3.5" />
										</div>
										<p className="font-medium text-[11px] text-text-soft-400 uppercase tracking-[0.18em]">
											Pro Tip
										</p>
									</div>
									<p className="pt-2 text-sm text-text-sub-600">
										Use separate domain for domain reputation
									</p>
									<div className="pt-3 text-sm text-text-sub-600">
										<p>Subdomain example:</p>
										<ul className="list-disc pl-5">
											<li>marketing.example.com</li>
											<li>send.example.com</li>
											<li>transection.example.com</li>
										</ul>
									</div>
								</div>
							</motion.section>

							<div className="pt-2">
								<button
									type="button"
									onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
									className="flex items-center gap-2 rounded-md py-2 text-text-sub-600 transition-colors hover:text-text-strong-950"
								>
									<motion.div
										animate={{ rotate: isAdvancedOpen ? 90 : 0 }}
										transition={matchedRevealTransition}
										className="flex h-3 w-3 items-center justify-center"
									>
										<Icon name="chevron-right" className="h-full w-full" />
									</motion.div>
									<span className="font-medium text-xs">Advanced options</span>
								</button>

								<motion.section
									initial={false}
									animate={{
										maxHeight: isAdvancedOpen ? 500 : 0,
										opacity: isAdvancedOpen ? 1 : 0,
										marginTop: isAdvancedOpen ? 0 : 0,
									}}
									transition={{
										maxHeight: matchedRevealTransition,
										opacity: matchedRevealTransition,
									}}
									className="overflow-hidden"
								>
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
													<Icon
														name="alert-circle"
														className="h-4 w-4 text-red-500"
													/>
													<p className="text-red-600 text-xs">
														{formState.errors.customReturnPath.message}
													</p>
												</div>
											)}
										</div>
									</div>
								</motion.section>
							</div>

							<div className="sticky bottom-0 z-10">
								<div className="w-full rounded-2xl bg-bg-white-0/92 shadow-[0_16px_40px_-28px_rgba(18,18,23,0.28)] backdrop-blur">
									<Button.Root
										type="submit"
										variant="neutral"
										mode="filled"
										disabled={status === "loading" || !formState.isValid}
										className="w-full"
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
							</div>
						</motion.form>
					</div>
				</div>

				<div className="relative hidden h-full min-w-0 flex-1 overflow-hidden bg-bg-weak-50/10 lg:flex">
					<div className="relative z-10 h-full w-full">
						<div className="flex h-full items-start justify-center px-2 pt-10 pb-12">
							<DomainPreview domain={watch("domain")} variant="domain" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
