"use client";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
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
		<div className="mx-auto max-w-3xl pt-10 pb-8">
			<Button.Root
				onClick={() => back()}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
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
				<h2 className="font-semibold text-gray-900 text-lg">Domain</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Add a subdomain (eg. marketing.example.com)
				</p>
			</div>
			<div className="flex gap-6">
				<form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
					<div>
						<Label.Root
							htmlFor="domain"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Domain Name
							<Label.Asterisk />
						</Label.Root>
						<div className="relative">
							<Input.Root
								hasError={!!formState?.errors?.domain?.message}
								className="w-full"
							>
								<Input.Affix className="bg-gray-50 text-gray-500">
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
							size="small"
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
									<Icon
										name="undo"
										className="h-5 w-5 scale-y-[-1] rounded-md bg-bg-white-0/10 p-1"
									/>
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
			<div className="mb-6 gap-3 border-stroke-soft-200 border-t border-dashed pt-6">
				<h2 className="font-semibold text-lg text-text-sub-600">DNS Records</h2>
				<p className="text-paragraph-sm text-text-sub-600">
					Add DNS records to your domain to start sending emails
				</p>
			</div>
		</div>
	);
};
