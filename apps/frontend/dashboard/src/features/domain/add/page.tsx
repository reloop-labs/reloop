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
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { DomainPreview } from "#/features/onboarding/domain-preview";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import type { DomainListResponse, DomainResponse } from "../types";
import { AddDomainHeader } from "./components/add-domain-header";
import { AdvancedOptions } from "./components/advanced-options";
import { DomainInputField } from "./components/domain-input-field";
import type { DomainFormValues } from "./schema";
import { domainSchema } from "./schema";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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
				clickTracking: true,
				openTracking: true,
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
					// Receiving + tracking on by default for new domains.
					receiving_email: true,
					// Return path + tracking host labels are fixed server-side.
					tls: "opportunistic",
				},
				{ withCredentials: true },
			);
			await invalidate();
			changeStatus("idle");
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
						changeStatus("idle");
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
		"mod+backspace",
		(e) => {
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			) {
				return;
			}
			e.preventDefault();
			router.push("/domain");
		},
		// Allow cancel while the domain field is focused (overrides native ⌘⌫).
		{ enableOnFormTags: true, preventDefault: true },
	);

	return (
		<div className="flex h-[calc(100dvh-200px)] items-center">
			<div className="mx-auto grid w-full max-w-5xl lg:grid-cols-2">
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
												<ActionKbd className={actionKbdOnBlueClassName}>
													↵
												</ActionKbd>
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
								className="gap-1.5 rounded-xl"
							>
								<Link href="/domain">
									Cancel
									<span className="inline-flex items-center gap-0.5">
										<ActionKbd className="w-auto min-w-0 px-1">⌘</ActionKbd>
										<ActionKbd className="w-auto min-w-4 px-1">
											<svg
												viewBox="0 -0.5 25 25"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
												className="size-3.5"
												aria-hidden
											>
												<path
													fillRule="evenodd"
													clipRule="evenodd"
													d="M5.91006 12.6651L8.35606 15.5261C8.59533 15.82 8.95209 15.9935 9.33106 16.0001L13.0501 15.9931H16.2391C18.0288 16.0036 19.4885 14.5618 19.5001 12.7721V10.2221C19.4891 8.43193 18.0292 6.98953 16.2391 7.00006L9.33106 7.00706C8.95226 7.01341 8.59552 7.18647 8.35606 7.48006L5.91006 10.3421C5.36331 11.0199 5.36331 11.9872 5.91006 12.6651V12.6651Z"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<path
													d="M12.1603 9.46359C11.864 9.17409 11.3892 9.17957 11.0997 9.47582C10.8102 9.77207 10.8156 10.2469 11.1119 10.5364L12.1603 9.46359ZM12.6469 12.0364C12.9431 12.3259 13.418 12.3204 13.7075 12.0242C13.997 11.7279 13.9915 11.2531 13.6953 10.9636L12.6469 12.0364ZM13.6963 10.9646C13.4006 10.6745 12.9258 10.6791 12.6357 10.9748C12.3456 11.2705 12.3502 11.7453 12.6458 12.0354L13.6963 10.9646ZM14.1748 13.5354C14.4705 13.8255 14.9454 13.8209 15.2355 13.5252C15.5255 13.2295 15.521 12.7547 15.2253 12.4646L14.1748 13.5354ZM13.6953 12.0364C13.9915 11.7469 13.997 11.2721 13.7075 10.9758C13.418 10.6796 12.9431 10.6741 12.6469 10.9636L13.6953 12.0364ZM11.1119 12.4636C10.8156 12.7531 10.8102 13.2279 11.0997 13.5242C11.3892 13.8204 11.864 13.8259 12.1603 13.5364L11.1119 12.4636ZM12.6458 10.9646C12.3502 11.2547 12.3456 11.7295 12.6357 12.0252C12.9258 12.3209 13.4006 12.3255 13.6963 12.0354L12.6458 10.9646ZM15.2253 10.5354C15.521 10.2453 15.5255 9.77046 15.2355 9.47477C14.9454 9.17909 14.4705 9.17454 14.1748 9.46462L15.2253 10.5354ZM11.1119 10.5364L12.6469 12.0364L13.6963 10.9636L12.1603 9.46359L11.1119 10.5364ZM12.6458 12.0354L14.1748 13.5354L15.2253 12.4646L13.6963 10.9646L12.6458 10.9646ZM12.6469 10.9636L11.1119 12.4636L12.1603 13.5364L13.6953 12.0364L12.6469 10.9636ZM13.6963 12.0354L15.2253 10.5354L14.1748 9.46462L12.6458 10.9646L13.6963 12.0354Z"
													fill="currentColor"
												/>
											</svg>
										</ActionKbd>
									</span>
								</Link>
							</Button.Root>
						</div>
					</form>
				</div>

				{/* Right: email preview */}
				<div className="hidden h-full items-center justify-center overflow-hidden lg:flex">
					<div className="relative h-full w-full">
						<DomainPreview domain={watchedDomain} variant="domain" />
					</div>
				</div>
			</div>
		</div>
	);
}
