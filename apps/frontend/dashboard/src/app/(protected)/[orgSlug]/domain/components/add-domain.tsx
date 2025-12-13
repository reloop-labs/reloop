"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
});

type DomainFormValues = v.InferInput<typeof domainSchema>;

export const AddDomainSidebar = () => {
	const { push } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const { back } = useRouter();
	const { register, handleSubmit, formState, setError } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			defaultValues: {
				domain: "",
			},
		});

	const handleAddDomain = (domain: string) => {
		push(`/domain/add/${domain}`);
	};

	// Handle Escape key to go back
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				back();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [back]);

	const onSubmit = async ({ domain }: DomainFormValues) => {
		try {
			changeStatus("loading");
			await axios.post(
				"/api/domain/v1/add",
				{ domain },
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
			<button
				type="button"
				onClick={() => back()}
				className="group flex items-center gap-1.5 px-2 py-1.5 text-paragraph-sm font-medium text-text-sub-600 transition-all duration-300 hover:text-text-strong-950 cursor-pointer"
			>
				<div className="relative flex items-center justify-center w-3.5 h-3.5 overflow-visible">
					{/* Arrow tail - hidden by default, slides in on hover */}
					<div className="absolute right-[4px] h-[1.25px] w-0 bg-current transition-all duration-300 ease-out group-hover:w-2.5" />
					{/* Chevron/Arrow head - nudges left on hover */}
					<svg
						width="6"
						height="10"
						viewBox="0 0 8 12"
						fill="none"
						className="absolute left-0 transition-all duration-300 ease-out group-hover:-translate-x-0.5"
					>
						<path
							d="M7 1L1.5 6L7 11"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				<span className="transition-all duration-300 group-hover:tracking-wide text-xs">Back</span>
				<Kbd.Root className="bg-bg-weak-50 text-[10px] px-1.5 py-0.5">Esc</Kbd.Root>
			</button>
			<div className="flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pt-6 pb-6">
				<div>
					<h1 className="font-medium text-title-h5 leading-8">Add Domain</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						You need a domain to send emails from your own domain
					</p>
				</div>

				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={() => window.open("https://reloop.sh/docs/domain", "_blank")}
				>
					<Icon name="file-text" className="h-4 w-4" />
					Go to docs
				</Button.Root>
			</div>

			<div className="my-6 gap-3">
			</div>
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
								<Input.Affix className="bg-bg-white-0 text-text-strong-950
">
									https://
								</Input.Affix>
								<Input.Wrapper>
									<Input.Input
										id="domain"
										placeholder="www.example.com"
										{...register("domain")}
										disabled={status === "loading"}
										className="pl-4"
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
									<Spinner color="white" />
									Adding Domain...
								</>
							) : (
								<>
									Add Domain
									<Icon name="enter" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
								</>
							)}
						</Button.Root>
					</div>
				</form>
				<div className="mt-[29px] mb-10 w-96 rounded-2xl border border-stroke-soft-200 p-4">
					<div className="flex items-center gap-2 text-xs uppercase">
						<Icon name="bulb" className="h-3 w-3" />
						<p>Pro Tip</p>
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
			</div>
		</div>
	);
};
