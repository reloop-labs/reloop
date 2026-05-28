"use client";
import { DomainPreview } from "@fe/dashboard/app/(protected)/onboarding/components/domain-preview";
import type { DomainResponse } from "@fe/dashboard/types/api.types";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Accordion from "@reloop/ui/accordion";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import { AddDomainHeader } from "./components/add-domain-header";
import { AdvancedOptions } from "./components/advanced-options";
import { DomainInputField } from "./components/domain-input-field";
import type { DomainFormValues } from "./schema";
import { domainSchema } from "./schema";

const AddDomain = () => {
	const router = useRouter();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

	const { register, handleSubmit, formState, setError, watch, control } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			defaultValues: {
				domain: "",
				clickTracking: false,
				openTracking: false,
				customReturnPath: "receive",
				trackingSubdomain: "links",
			},
		});

	const handleAddDomain = (domainId: string) => {
		router.push(`/domain/add/${domainId}`);
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
					custom_return_path: customReturnPath,
					tracking: trackingSubdomain,
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
						isLoading={status === "loading"}
						domain={watch("domain")}
					/>

					<div className="mt-4 w-full">
						<button
							type="button"
							onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
							className="flex w-full cursor-pointer items-center justify-between py-1 outline-none"
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
									domain={watch("domain")}
									isLoading={status === "loading"}
								/>
							</div>
						)}
					</div>
					<div className="mt-6 flex items-center gap-3">
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
							variant="neutral"
							mode="stroke"
							size="xsmall"
							asChild
							disabled={status === "loading"}
						>
							<Link href={"/domain"}>
								Cancel
								<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
									Esc
								</span>
							</Link>
						</Button.Root>
					</div>
				</form>
			</div>

			<div className="sticky top-0 hidden h-[calc(100vh-64px)] items-start justify-center overflow-hidden pt-12 lg:flex">
				<div className="relative h-full w-full">
					<DomainPreview domain={watch("domain")} variant="domain" />
				</div>
			</div>
		</div>
	);
};

export default AddDomain;
