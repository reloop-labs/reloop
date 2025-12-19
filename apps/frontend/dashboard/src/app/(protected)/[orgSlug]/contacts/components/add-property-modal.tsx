"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/layout/sidebar/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface AddPropertyModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const typeOptions = [
	{ value: "string" as const, label: "String" },
	{ value: "number" as const, label: "Number" },
];

export const AddPropertyModal = ({
	open,
	onOpenChange,
}: AddPropertyModalProps) => {
	const { mutate } = useSWRConfig();
	const [isCreating, setIsCreating] = useState(false);
	const [propertyName, setPropertyName] = useState("");
	const [nameError, setNameError] = useState("");
	const [propertyType, setPropertyType] = useState<"string" | "number">(
		"string",
	);
	const [fallbackValue, setFallbackValue] = useState("");

	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<HTMLButtonElement[]>([]);
	const nameInputRef = useRef<HTMLInputElement>(null);

	const currentTab = itemRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	// Reset state when modal closes
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setPropertyName("");
			setNameError("");
			setPropertyType("string");
			setFallbackValue("");
		}
		onOpenChange(isOpen);
	};

	// Validate property name - only letters, numbers, and underscores
	const validatePropertyName = (name: string): boolean => {
		const validPattern = /^[a-zA-Z0-9_]*$/;
		return validPattern.test(name);
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setPropertyName(value);

		if (value && !validatePropertyName(value)) {
			setNameError("Name can only contain letters, numbers, and underscores");
		} else {
			setNameError("");
		}
	};

	// Command/Ctrl + Enter to submit form
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (propertyName) {
				handleSubmit(new Event("submit") as unknown as React.FormEvent);
			}
		},
		{ enableOnFormTags: ["INPUT"] },
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!propertyName || nameError) return;

		setIsCreating(true);
		try {
			const response = await fetch("/api/contacts/v1/properties/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: propertyName,
					type: propertyType,
					fallbackValue: fallbackValue || undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to create property");
			}

			toast.success("Property created successfully");
			handleOpenChange(false);
			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes("/api/contacts/v1/properties/list"),
			);
		} catch (error) {
			console.error("Failed to create property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create property",
			);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="justify-centers flex items-center">
							<Icon name="sliders-horiz-2" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Add Property</Modal.Title>
						</div>
					</Modal.Header>
					<form onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="space-y-4">
							{/* Property Name */}
							<div className="flex flex-col gap-1 space-y-1">
								<Label.Root htmlFor="propertyName">
									Name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="small" hasError={!!nameError}>
									<Input.Wrapper>
										<Input.Input
											ref={nameInputRef}
											id="propertyName"
											placeholder="e.g., first_name, company_name"
											value={propertyName}
											onChange={handleNameChange}
											disabled={isCreating}
										/>
									</Input.Wrapper>
								</Input.Root>
								{nameError ? (
									<p className="text-error-base text-xs">{nameError}</p>
								) : (
									<p className="text-text-sub-600 text-xs">
										Letters, numbers, and underscores only
									</p>
								)}
							</div>

							{/* Property Type - Full Width */}
							<div className="flex flex-col gap-1 space-y-1">
								<Label.Root htmlFor="propertyType">
									Type
									<Label.Asterisk />
								</Label.Root>
								<Select.Root
									size="small"
									value={propertyType}
									onValueChange={(value: "string" | "number") =>
										setPropertyType(value)
									}
									disabled={isCreating}
								>
									<Select.Trigger className="w-full text-paragraph-sm">
										<Select.Value placeholder="Select type" />
									</Select.Trigger>
									<Select.Content className="min-w-[var(--radix-select-trigger-width)] text-paragraph-sm">
										<div className="relative">
											{typeOptions.map((option, idx) => (
												<Select.Item
													key={option.value}
													value={option.value}
													className="h-8 data-[highlighted]:bg-transparent"
													ref={(el) => {
														if (el)
															itemRefs.current[idx] =
																el as unknown as HTMLButtonElement;
													}}
													onPointerEnter={() => setHoverIdx(idx)}
													onPointerLeave={() => setHoverIdx(undefined)}
												>
													{option.label}
												</Select.Item>
											))}
											<AnimatedHoverBackground
												rect={currentRect}
												tabElement={currentTab}
											/>
										</div>
									</Select.Content>
								</Select.Root>
							</div>

							{/* Fallback Value - Full Width */}
							<div className="flex flex-col gap-1 space-y-1">
								<Label.Root htmlFor="fallbackValue">Default Value</Label.Root>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											id="fallbackValue"
											placeholder="Default value when property is empty"
											value={fallbackValue}
											onChange={(e) => setFallbackValue(e.target.value)}
											disabled={isCreating}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</Modal.Body>

						{/* Footer */}
						<Modal.Footer className="mt-4 justify-end border-stroke-soft-100/50">
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={isCreating || !propertyName || !!nameError}
							>
								{isCreating ? (
									<>
										<Spinner size={14} color="currentColor" />
										Creating...
									</>
								) : (
									<>
										Add Property
										<span className="inline-flex items-center gap-0.5">
											<Icon
												name="enter"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
										</span>
									</>
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
