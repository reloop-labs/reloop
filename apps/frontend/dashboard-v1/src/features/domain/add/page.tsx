import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import { Link, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { DomainPreview } from "#/features/onboarding/domain-preview";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import type { DomainListResponse, DomainResponse } from "../types";
import { AddDomainHeader } from "./components/add-domain-header";
import { AdvancedOptions } from "./components/advanced-options";
import { DomainInputField } from "./components/domain-input-field";
import type { DomainFormValues } from "./schema";
import { domainSchema } from "./schema";

export function AddDomainPage() {
	const navigate = useNavigate();
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
				customReturnPath: "receive",
				trackingSubdomain: "link",
			},
		});

	const watchedDomain = watch("domain");

	const goToSetup = (domainId: string) => {
		void navigate({
			to: "/domain/add/$domainId",
			params: { domainId },
		});
	};

	const onSubmit = async ({
		domain,
		clickTracking,
		openTracking,
		customReturnPath,
		trackingSubdomain,
	}: DomainFormValues) => {
		try {
			changeStatus("loading");
			const { data } = await axios.post<DomainResponse>(
				"/api/domain/v1/create",
				{
					domain,
					click_tracking: clickTracking,
					open_tracking: openTracking,
					custom_return_path: customReturnPath || "receive",
					tracking: trackingSubdomain || "link",
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

	return (
		<div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-5xl lg:grid-cols-2">
			<div className="mx-auto w-full max-w-md px-6 py-12 lg:px-8">
				<AddDomainHeader />
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="mt-6 flex w-full flex-col"
				>
					<DomainInputField
						register={register}
						errors={formState.errors}
						domain={watchedDomain}
						isLoading={status === "loading"}
					/>

					<button
						type="button"
						onClick={() => setIsAdvancedOpen((o) => !o)}
						className="mt-4 flex items-center gap-1.5 font-medium text-text-sub-600 text-xs hover:text-text-strong-950"
					>
						<Icon
							name="chevron-down"
							className={cn(
								"h-3.5 w-3.5 transition-transform",
								isAdvancedOpen && "rotate-180",
							)}
						/>
						Advanced options
					</button>

					<AnimatePresence initial={false}>
						{isAdvancedOpen && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="overflow-hidden"
							>
								<div className="pt-4">
									<AdvancedOptions
										control={control}
										register={register}
										isLoading={status === "loading"}
										domain={watchedDomain}
										errors={formState.errors}
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="mt-8 flex items-center gap-2">
						<Link
							to="/domain"
							className={`${Button.buttonVariants({ variant: "neutral", mode: "stroke", size: "small" }).root()}`}
						>
							Cancel
						</Link>
						<Button.Root
							type="submit"
							variant="neutral"
							size="small"
							disabled={status === "loading" || !formState.isValid}
						>
							{status === "loading" ? (
								<>
									<Spinner size={14} color="currentColor" />
									Adding…
								</>
							) : (
								"Continue"
							)}
						</Button.Root>
					</div>
				</form>
			</div>
			<div className="hidden items-center justify-center border-stroke-soft-100 border-l bg-bg-weak-50/30 lg:flex dark:border-stroke-soft-100/40">
				<DomainPreview domain={watchedDomain} />
			</div>
		</div>
	);
}
