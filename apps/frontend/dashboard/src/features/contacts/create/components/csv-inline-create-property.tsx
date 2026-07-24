import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	useInvalidateContacts,
	type Property,
} from "#/features/contacts/hooks/use-contacts-query";
import {
	slugifyPropertyName,
	validatePropertyName,
} from "../utils/property-mapping";

type PropertyType = "string" | "number";

const TYPE_OPTIONS: {
	value: PropertyType;
	label: string;
	icon: "text" | "hash";
}[] = [
	{ value: "string", label: "String", icon: "text" },
	{ value: "number", label: "Number", icon: "hash" },
];

interface CsvInlineCreatePropertyProps {
	/** Prefill name from a CSV header when opening create mid-flow */
	initialName?: string;
	onCreated: (property: Pick<Property, "id" | "propertyName" | "propertyType">) => void;
	onCancel: () => void;
	disabled?: boolean;
}

export function CsvInlineCreateProperty({
	initialName = "",
	onCreated,
	onCancel,
	disabled = false,
}: CsvInlineCreatePropertyProps) {
	const invalidate = useInvalidateContacts();
	const nameInputRef = useRef<HTMLInputElement>(null);
	const [propertyName, setPropertyName] = useState(
		initialName ? slugifyPropertyName(initialName) : "",
	);
	const [nameError, setNameError] = useState("");
	const [propertyType, setPropertyType] = useState<PropertyType>("string");
	const [status, setStatus] = useState<"idle" | "creating">("idle");

	useEffect(() => {
		nameInputRef.current?.focus();
	}, []);

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPropertyName(value);
		setNameError(validatePropertyName(value));
	};

	const handleSlugify = () => {
		const slugged = slugifyPropertyName(propertyName);
		setPropertyName(slugged);
		setNameError(validatePropertyName(slugged));
	};

	const canSubmit =
		!!propertyName && !nameError && status !== "creating" && !disabled;

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!canSubmit) return;

		const name = slugifyPropertyName(propertyName);
		if (!name) {
			setNameError("Name is required");
			return;
		}
		const err = validatePropertyName(name);
		if (err) {
			setNameError(err);
			return;
		}

		setStatus("creating");
		try {
			const response = await fetch("/api/contacts/v1/properties/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					type: propertyType,
				}),
				credentials: "include",
			});

			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as {
					message?: string;
				};
				throw new Error(data.message || "Failed to create property");
			}

			const created = (await response.json()) as {
				id: string;
				propertyName: string;
				propertyType: string;
			};

			await invalidate();
			toast.success(`Created property “${created.propertyName}”`);
			onCreated({
				id: created.id,
				propertyName: created.propertyName,
				propertyType: created.propertyType,
			});
		} catch (error) {
			console.error("Failed to create property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create property",
			);
			setStatus("idle");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-3 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/40 px-4 py-3"
		>
			<div className="flex items-center justify-between gap-2">
				<p className="font-semibold text-text-strong-950 text-xs">
					New property
				</p>
				<button
					type="button"
					onClick={onCancel}
					disabled={status === "creating" || disabled}
					className="inline-flex cursor-pointer items-center text-text-sub-600 transition-colors hover:text-text-strong-950 disabled:opacity-50"
					aria-label="Cancel create property"
				>
					<Icon name="cross" className="h-3.5 w-3.5" />
				</button>
			</div>

			<div className="grid gap-3 sm:grid-cols-[1fr_auto]">
				<div className="space-y-1.5">
					<Label.Root
						htmlFor="csv-inline-property-name"
						className="text-[11px] text-text-sub-600"
					>
						Name
					</Label.Root>
					<Input.Root
						size="small"
						hasError={!!nameError}
						className="rounded-lg"
					>
						<Input.Wrapper>
							<Input.Input
								ref={nameInputRef}
								id="csv-inline-property-name"
								placeholder="e.g. company_plan"
								value={propertyName}
								onChange={handleNameChange}
								onBlur={handleSlugify}
								disabled={status === "creating" || disabled}
								autoComplete="off"
								spellCheck={false}
							/>
						</Input.Wrapper>
					</Input.Root>
					{nameError ? (
						<p className="text-[11px] text-error-base">{nameError}</p>
					) : (
						<p className="text-[11px] text-text-sub-600">
							Letters, numbers &amp; underscores — spaces auto-convert
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label.Root className="text-[11px] text-text-sub-600">Type</Label.Root>
					<div className="flex gap-1.5">
						{TYPE_OPTIONS.map((opt) => {
							const selected = propertyType === opt.value;
							return (
								<button
									key={opt.value}
									type="button"
									disabled={status === "creating" || disabled}
									onClick={() => setPropertyType(opt.value)}
									className={cn(
										"inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors disabled:opacity-50",
										selected
											? "border-primary-base bg-primary-light/10 font-medium text-text-strong-950"
											: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-stroke-soft-300",
									)}
								>
									<Icon name={opt.icon} className="h-3.5 w-3.5" />
									{opt.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 pt-0.5">
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="xsmall"
					onClick={onCancel}
					disabled={status === "creating" || disabled}
				>
					Cancel
				</Button.Root>
				<FancyButton.Root
					type="submit"
					variant="primary"
					size="xsmall"
					disabled={!canSubmit}
				>
					{status === "creating" ? (
						<>
							<Spinner size={12} color="currentColor" />
							Creating…
						</>
					) : (
						"Create"
					)}
				</FancyButton.Root>
			</div>
		</form>
	);
}
