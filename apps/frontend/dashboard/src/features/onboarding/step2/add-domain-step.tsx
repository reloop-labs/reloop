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

	const { register, handleSubmit, formState, setError, watch } =
		useForm<DomainFormValues>({
			resolver: valibotResolver(domainSchema) as Resolver<DomainFormValues>,
			mode: "onChange",
			defaultValues: {
				domain: domain || "",
				clickTracking: true,
				openTracking: true,
			},
		});

	const { isLoading, submitDomain, skipDns } = useAddDomain(setError);
	const watchedDomain = watch("domain");

	// Keep URL in sync so the right-panel preview updates live.
	React.useEffect(() => {
		setDomain(watchedDomain || null);
	}, [watchedDomain, setDomain]);

	const onSubmit = handleSubmit(submitDomain);

	// Enter must work while focus is in the domain <input>. Native form submit is
	// unreliable here (FancyButton + RHF), so bind Enter explicitly like other modals.
	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!isLoading) {
				void onSubmit();
			}
		},
		{ enableOnFormTags: true, preventDefault: true },
		[isLoading, onSubmit],
	);

	// ⌥S skips domain setup — enable on inputs so it works without leaving the field.
	useHotkeys(
		"alt+s",
		(e) => {
			e.preventDefault();
			if (!isLoading) {
				skipDns();
			}
		},
		{ enableOnFormTags: true },
		[isLoading, skipDns],
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
					Add Domain
				</h1>
				<p className="text-sm text-text-sub-600">
					Connect your website&apos;s domain (like yourcompany.com) so emails
					come from your business — not a generic address
				</p>
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (!isLoading) void onSubmit();
				}}
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
