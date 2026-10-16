"use client";

import { Icon } from "@reloop/ui/icon";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSWR } from "../../hooks/use-swr-compat";
import { useTemplateId } from "../../hooks/use-template-id";
import { TemplateFieldRow } from "./template-field-row";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

/** Lowercase and dash-join as the user types so the field can't hold an invalid slug. */
function sanitizeSlugInput(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-+/, "")
		.slice(0, 128);
}

export const TemplateSlugField = () => {
	const templateId = useTemplateId();
	const { data, mutate } = useSWR<{ slug?: string }>(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);
	const savedSlug = data?.slug ?? "";
	const [slug, setSlug] = useState(savedSlug);
	const [copied, setCopied] = useState(false);
	const cancelled = useRef(false);

	// Follow server-side changes (e.g. a rename regenerating a draft's slug).
	useEffect(() => {
		setSlug(savedSlug);
	}, [savedSlug]);

	const save = async () => {
		const next = slug.replace(/-+$/, "");
		if (cancelled.current || !templateId || next === savedSlug) {
			cancelled.current = false;
			setSlug(savedSlug);
			return;
		}
		if (!SLUG_RE.test(next)) {
			toast.error("Use lowercase letters, numbers, and dashes.");
			setSlug(savedSlug);
			return;
		}
		try {
			const res = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug: next }),
				credentials: "include",
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				toast.error(
					res.status === 409
						? `Another template already uses "${next}".`
						: (body?.message ?? "Failed to update slug."),
				);
				setSlug(savedSlug);
				return;
			}
			mutate(await res.json(), false);
		} catch {
			toast.error("Failed to update slug.");
			setSlug(savedSlug);
		}
	};

	const copy = async () => {
		if (!savedSlug) return;
		await navigator.clipboard.writeText(savedSlug);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<TemplateFieldRow
			id="template-send-details-slug"
			label="Slug"
			infoTooltip={{
				title: "Template slug",
				description:
					"Send this template by slug from the API: template: { slug }. Changing it breaks code that uses the old slug.",
			}}
		>
			<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600">
				<input
					id="template-send-details-slug"
					value={slug}
					onChange={(e) => setSlug(sanitizeSlugInput(e.target.value))}
					onBlur={save}
					onKeyDown={(e) => {
						if (e.key === "Enter") e.currentTarget.blur();
						if (e.key === "Escape") {
							cancelled.current = true;
							e.currentTarget.blur();
						}
					}}
					placeholder="welcome-email"
					spellCheck={false}
					autoComplete="off"
					className="flex-1 bg-transparent font-mono text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
				/>
				<button
					type="button"
					onClick={copy}
					disabled={!savedSlug}
					className="flex h-5 w-5 items-center justify-center rounded text-text-soft-400 transition-colors hover:text-text-strong-950 focus:outline-none"
					title="Copy slug"
					aria-label="Copy slug"
				>
					<Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
				</button>
			</div>
		</TemplateFieldRow>
	);
};
