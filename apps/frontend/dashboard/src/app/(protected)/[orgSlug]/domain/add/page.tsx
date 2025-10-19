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
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import * as v from "valibot";
import { Globe } from "../globe";

const domainSchema = v.object({
	domain: v.pipe(
		v.string("Domain is required"),
		v.minLength(1, "Domain is required"),
		v.regex(
			/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
			"Please enter a valid domain name",
		),
	),
});

type DomainFormValues = v.InferInput<typeof domainSchema>;

const NewDomainPage = () => {
	const { push } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();

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

			// Mutate the DNS records cache to trigger a fresh fetch
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
		<div className="mx-auto max-w-3xl">
			<div className="my-10 flex items-center gap-3">
				<Globe className="rounded-full" iconClassName="h-8 w-8" />
				<div>
					<h1 className="font-medium text-title-h4 leading-8">Add Domain</h1>
					<p className="text-paragraph-sm text-text-sub-600">
						Add a new domain and start sending emails from your domain
					</p>
				</div>
			</div>
			<div className="relative my-10 ml-8 border-stroke-soft-200 border-l py-10">
				<div className="relative flex flex-col pl-10">
					<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
						<div className="h-3 w-3 rounded-full border-2 bg-bg-white-0" />
					</div>
					<div className="flex gap-10">
						<div>
							<p className="font-medium text-title-h5">Domain</p>
							<p className="text-paragraph-sm text-text-sub-600">
								Add a new domain send emails from your domain
							</p>
							<form onSubmit={handleSubmit(onSubmit)} className="w-96">
								<div className="mt-5">
									<Label.Root htmlFor="domain">
										Domain
										<Label.Asterisk />
									</Label.Root>
									<Input.Root hasError={!!formState?.errors?.domain?.message}>
										<Input.Affix>https://</Input.Affix>
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
										<p className="mt-1 text-error-base text-paragraph-sm">
											{formState.errors.domain.message}
										</p>
									)}
								</div>
								<div className="flex w-96 justify-end">
									<Button.Root
										type="submit"
										className="mt-5"
										variant="neutral"
										disabled={status === "loading" || !formState.isValid}
									>
										{status === "loading" && (
											<Spinner color="var(--text-strong-950)" />
										)}
										{status === "loading" ? "Adding Domain..." : "Add Domain"}
									</Button.Root>
								</div>
							</form>
						</div>
						<div className="mt-24 h-fit rounded-2xl border border-stroke-soft-200 p-4">
							<div className="flex items-center gap-2 uppercase">
								<Icon name="bulb" className="h-4 w-4" />
								<p>Recommendations</p>
							</div>
							<p className="w-60 pt-2 text-sm text-text-sub-600">
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
				<div className="relative mt-10 pl-10">
					<div className="-left-3.5 absolute top-1 rounded-full bg-bg-white-0 p-2">
						<div className="h-3 w-3 rounded-full border-2 border-stroke-soft-200 bg-bg-white-0" />
					</div>
					<p className="font-medium text-text-sub-600 text-title-h5">
						DNS Records
					</p>
				</div>
			</div>
		</div>
	);
};

export default NewDomainPage;
