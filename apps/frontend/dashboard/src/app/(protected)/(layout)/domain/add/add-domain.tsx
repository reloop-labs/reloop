"use client";
import { DomainPreview } from "@fe/dashboard/app/(protected)/onboarding/components/previews";
import { valibotResolver } from "@hookform/resolvers/valibot";
import type { DomainResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import { AddDomainHeader } from "./components/add-domain-header";
import { AdvancedOptions } from "./components/advanced-options";
import { DomainInputField } from "./components/domain-input-field";
import type { DomainFormValues } from "./schema";
import { domainSchema } from "./schema";

export const AddDomainSidebar = () => {
	const router = useRouter();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();

	const { register, handleSubmit, formState, setError, watch } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			defaultValues: {
				domain: "",
				customReturnPath: "send",
			},
		});

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
					className="scrollbar-hide flex w-full flex-col overflow-y-auto lg:w-1/2 lg:shrink-0"
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					<div className="mx-auto w-full px-2 pt-8 pb-10">
						<AddDomainHeader />
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="flex w-full flex-col gap-3"
						>
							<DomainInputField
								register={register}
								errors={formState.errors}
								isLoading={status === "loading"}
							/>

							<AdvancedOptions
								register={register}
								errors={formState.errors}
								isLoading={status === "loading"}
							/>

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
						</form>
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
