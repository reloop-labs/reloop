import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { DomainPreview } from "#/features/onboarding/domain-preview";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import type { DomainListResponse, DomainResponse } from "../types";
import { AddDomainHeader } from "./components/add-domain-header";
import { AdvancedOptions } from "./components/advanced-options";
import { DomainInputField } from "./components/domain-input-field";
import type { DomainFormValues } from "./schema";
import { domainSchema } from "./schema";

export function AddDomainPage() {
	const router = useRouter();
	const { changeStatus, status } = useLoading();
	const invalidate = useInvalidateDomains();
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

	const { register, handleSubmit, formState, setError, watch, control } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			mode: "onChange",
			defaultValues: {
				domain: "",
				clickTracking: false,
				openTracking: false,
			},
		});

	const watchedDomain = watch("domain");

	const goToSetup = (domainId: string) => {
		router.push(`/domain/add/${domainId}`);
	};

	const onSubmit = async ({
		domain,
		clickTracking,
		openTracking,
	}: DomainFormValues) => {
		try {
			changeStatus("loading");
			const { data } = await axios.post<DomainResponse>(
				"/api/domain/v1/create",
				{
					domain,
					click_tracking: clickTracking,
					open_tracking: openTracking,
					// Return path + tracking host labels are fixed server-side.
					tls: "opportunistic",
				},
				{ withCredentials: true },
			);
			await invalidate();
			goToSetup(data.id);
		} catch (error) {
			const isAlreadyExists =
				axios.isAxiosError(error) &&
				(error.response?.status === 409 ||
					error.response?.data?.message === "Domain already exists");

			if (isAlreadyExists) {
				try {
					const { data: listData } = await axios.get<DomainListResponse>(
						"/api/domain/v1/list?limit=100",
						{ withCredentials: true },
					);
					const existingDomain = listData.domains?.find(
						(d) => d.domain.toLowerCase() === domain.toLowerCase(),
					);
					if (existingDomain) {
						goToSetup(existingDomain.id);
						return;
					}
				} catch (listError) {
					console.error("Failed to fetch existing domain ID:", listError);
				}
			}

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

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (status !== "loading") {
				void handleSubmit(onSubmit)();
			}
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		"esc",
		() => {
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			) {
				return;
			}
			router.push("/domain");
		},
		{ enableOnFormTags: true },
	);

	return (
		<div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-5xl lg:grid-cols-2">
			{/* Left: form column */}
			<div className="mx-auto w-full max-w-md px-6 py-12 lg:px-8">
				<AddDomainHeader />
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="mt-6 flex w-full flex-col"
				>
					<DomainInputField
						register={register}
						errors={formState.errors}
						isLoading={status === "loading"}
						domain={watchedDomain}
					/>

					<div className="mt-2 w-full">
						<button
							type="button"
							onClick={() => setIsAdvancedOpen((open) => !open)}
							className="flex w-full cursor-pointer items-center gap-1.5 py-1 outline-none"
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
						<AnimatePresence initial={false}>
							{isAdvancedOpen && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: "easeInOut" }}
									className="overflow-hidden"
								>
									<div className="my-2 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40">
										<AdvancedOptions
											control={control}
											register={register}
											domain={watchedDomain}
											isLoading={status === "loading"}
											errors={formState.errors}
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<div className="mt-5 flex items-center gap-3">
						<FancyButton.Root
							type="submit"
							variant="blue"
							size="small"
							disabled={status === "loading"}
							className={cn(
								"min-w-[134px] justify-center overflow-hidden rounded-xl transition-all duration-200",
								status === "loading" && "pointer-events-none opacity-90",
							)}
						>
							<AnimatePresence mode="popLayout" initial={false}>
								<motion.span
									key={status === "loading" ? "loading" : "idle"}
									transition={{
										type: "spring",
										duration: 0.25,
										bounce: 0,
									}}
									initial={{
										opacity: 0,
										y: -14,
									}}
									animate={{
										opacity: 1,
										y: 0,
									}}
									exit={{
										opacity: 0,
										y: 14,
									}}
									className="flex items-center justify-center gap-1.5"
								>
									{status === "loading" ? (
										<>
											<Spinner size={14} color="currentColor" />
											<span>Adding Domain...</span>
										</>
									) : (
										<>
											<span>Add Domain</span>
											<span className="inline-flex items-center gap-0.5">
												<Icon
													name="command"
													className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
												/>
												<Icon
													name="enter"
													className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
												/>
											</span>
										</>
									)}
								</motion.span>
							</AnimatePresence>
						</FancyButton.Root>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							asChild
							disabled={status === "loading"}
							className="rounded-xl"
						>
							<Link href="/domain">
								Cancel
								<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
									Esc
								</span>
							</Link>
						</Button.Root>
					</div>
				</form>
			</div>

			{/* Right: email preview — sticky, aligned with form column */}
			<div className="sticky top-0 hidden h-[calc(100vh-64px)] items-start justify-center overflow-hidden pt-12 lg:flex">
				<div className="relative h-full w-full">
					<DomainPreview domain={watchedDomain} variant="domain" />
				</div>
			</div>
		</div>
	);
}
