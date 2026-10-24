"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Modal from "@reloop/ui/modal";
import { Skeleton } from "@reloop/ui/skeleton";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";
import {
	ApiKeyAccessField,
	type ApiKeyAccessValue,
	accessToScope,
	scopeToAccess,
} from "./api-key-access-field";

/** Detail-page summary of what the key may use, with an edit action. */
export function ApiKeyAccessSection({
	apiKey,
	isLoading,
}: {
	apiKey: ApiKeyData | undefined;
	isLoading: boolean;
}) {
	const [, setAccessId] = useQueryState("access");
	const scope = apiKey?.scope ?? [];

	return (
		<section className="flex flex-col gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-stroke-soft-100/40">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0">
					<h2 className="font-medium text-label-md text-text-strong-950 dark:text-white">
						Access
					</h2>
					<p className="text-paragraph-sm text-text-sub-600">
						{scope.length === 0
							? "Full access to every domain and mailbox."
							: "Can only send from and sign in to:"}
					</p>
				</div>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="xsmall"
					disabled={!apiKey}
					onClick={() => apiKey && void setAccessId(apiKey.id)}
				>
					Edit
				</Button.Root>
			</div>
			{isLoading ? (
				<Skeleton className="h-6 w-48 rounded-full" />
			) : scope.length > 0 ? (
				<ul className="flex flex-wrap gap-1.5">
					{scope.map((entry) => (
						<li
							key={`${entry.domainId}:${entry.email ?? "*"}`}
							className="inline-flex h-6 items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 px-2 font-medium text-paragraph-sm text-text-strong-950 dark:border-stroke-soft-100/40"
						>
							<Icon
								name={entry.email ? "mail" : "globe"}
								className="size-3.5 text-text-sub-600"
							/>
							{entry.email ?? entry.domain}
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
}

/** `?access=<id>` modal that replaces a key's restrictions. */
export function EditApiKeyAccessModal({
	apiKey,
}: {
	apiKey: ApiKeyData | undefined;
}) {
	const [accessId, setAccessId] = useQueryState("access");
	const open = !!apiKey && accessId === apiKey.id;
	const invalidate = useInvalidateApiKeys();
	const [value, setValue] = useState<ApiKeyAccessValue>(() =>
		scopeToAccess(apiKey?.scope),
	);
	const [saving, setSaving] = useState(false);

	// Start from the saved restrictions each time the modal opens.
	useEffect(() => {
		if (open) {
			setValue(scopeToAccess(apiKey?.scope));
		}
	}, [open, apiKey?.scope]);

	const close = () => void setAccessId(null);

	const save = async () => {
		if (!apiKey || saving) return;
		try {
			setSaving(true);
			await axios.patch(
				`/api/api-key/v1/${apiKey.id}`,
				{ scope: accessToScope(value) },
				{ withCredentials: true },
			);
			await invalidate();
			toast.success("Access updated");
			close();
		} catch (error) {
			toast.error(
				axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to update access"
					: "Failed to update access",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && close()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[520px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<div className="flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-6">
					<div className="pr-10">
						<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
							Edit access
						</Modal.Title>
						<Modal.Description className="mt-1 text-paragraph-sm text-text-sub-600">
							Changes reach apps already using this key within a minute.
						</Modal.Description>
					</div>
					<ApiKeyAccessField
						value={value}
						onChange={setValue}
						disabled={saving}
					/>
					<div className="flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={close}
							disabled={saving}
							className="rounded-xl"
						>
							Cancel
						</Button.Root>
						<FancyButton.Root
							type="button"
							variant="neutral"
							size="small"
							onClick={() => void save()}
							disabled={saving}
							className="rounded-xl"
						>
							{saving ? <Spinner className="size-4" /> : null}
							Save access
						</FancyButton.Root>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
}
