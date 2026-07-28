import { valibotResolver } from "@hookform/resolvers/valibot";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { DomainInputField } from "./domain-input-field";
import { FormActions } from "./form-actions";
import { type DomainFormValues, domainSchema } from "./schema";
import { useAddDomain } from "./use-add-domain";

export function AddDomainStep() {
	const [domain, setDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);

	const { register, handleSubmit, formState, setError, watch, control } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			mode: "onChange",
			defaultValues: {
				domain: domain || "",
				clickTracking: false,
				openTracking: false,
			},
		});

	const { isLoading, submitDomain, skipDns } = useAddDomain(setError);
	const watchedDomain = watch("domain");

	// Keep URL in sync so the right-panel preview updates live.
	React.useEffect(() => {
		setDomain(watchedDomain || null);
	}, [watchedDomain, setDomain]);

	useHotkeys(
		"mod+enter",
		() => {
			if (!isLoading) {
				handleSubmit(submitDomain)();
			}
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		"alt+s",
		(e) => {
			e.preventDefault();
			if (!isLoading) {
				skipDns();
			}
		},
		{ enableOnFormTags: true },
	);

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					Add Domain
				</h1>
				<p className="text-text-sub-600 text-sm">
					Send emails from a domain you control
				</p>
			</div>
			<form
				onSubmit={handleSubmit(submitDomain)}
				className="flex w-full flex-col gap-6"
			>
				<DomainInputField
					register={register}
					errors={formState.errors}
					isLoading={isLoading}
					domain={watchedDomain}
				/>

				<FormActions isLoading={isLoading} onSkip={skipDns} />
			</form>
		</div>
	);
}
