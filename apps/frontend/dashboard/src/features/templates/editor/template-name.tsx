import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useSWR } from "#/features/templates/editor/lib/use-swr-compat";
import { useTemplateId } from "#/features/templates/editor/lib/use-template-id";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

function TemplateStatusBadge({
	status,
}: {
	status: "draft" | "published" | "archived";
}) {
	// Match list page: published is badge-free; draft/archived use muted pills.
	if (status === "published") return null;

	const label = status === "draft" ? "Draft" : "Archived";

	return (
		<span
			className={cn(
				"ml-2 shrink-0 select-none rounded-full px-2.5 py-1 font-medium text-[11px] leading-none",
				status === "draft" &&
					"bg-bg-weak-50 text-text-sub-600 ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-soft-200 dark:ring-stroke-soft-100/40",
				status === "archived" &&
					"bg-faded-lighter text-faded-base ring-1 ring-stroke-soft-100 ring-inset",
			)}
		>
			{label}
		</span>
	);
}

export const TemplateName = () => {
	const templateId = useTemplateId();

	const { data, mutate, isLoading } = useSWR(
		templateId ? `/api/template/v1/${templateId}` : null,
		fetcher,
	);
	const [name, setName] = useState("");
	const isInitialLoad = useRef(true);

	useEffect(() => {
		if (data?.name && isInitialLoad.current) {
			setName(data.name);
			isInitialLoad.current = false;
		}
	}, [data?.name]);

	const debouncedUpdate = useDebounceCallback(async (newName: string) => {
		if (!templateId || !newName) return;
		try {
			const response = await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newName }),
				credentials: "include",
			});
			if (response.ok) {
				mutate({ ...data, name: newName }, false);
			}
		} catch (error) {
			console.error("Failed to update template name:", error);
		}
	}, 1000);

	const inputRef = useRef<HTMLInputElement>(null);
	const measureRef = useRef<HTMLSpanElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: name changes DOM width, which we need to measure
	useEffect(() => {
		if (measureRef.current && inputRef.current) {
			const width = measureRef.current.offsetWidth;
			inputRef.current.style.width = `${width}px`;
		}
	}, [name]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setName(newName);
		debouncedUpdate(newName);
	};

	if (isLoading && !name) {
		return <div className="h-7 w-48 animate-pulse rounded-md bg-bg-weak-50" />;
	}

	return (
		<div className="flex items-center">
			<div className="flex items-center gap-1.5">
				<Icon name="layout" className="size-4 text-text-sub-600" />
				<Link
					href="/templates"
					className="font-medium text-label-sm text-text-sub-600 hover:text-text-strong-950"
				>
					Templates
				</Link>
			</div>

			<span className="ml-2.5 text-text-disabled-300 text-xs">/</span>

			<div className="group ml-1 flex items-center">
				<span
					ref={measureRef}
					className="invisible absolute whitespace-pre px-2 py-1 font-semibold text-label-sm"
					aria-hidden="true"
				>
					{name || "Template name"}
				</span>
				<input
					ref={inputRef}
					value={name}
					onChange={handleChange}
					placeholder="Template name"
					className="rounded-md bg-transparent px-2 py-1 font-semibold text-label-sm text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 hover:bg-bg-weak-50 focus:ring-0"
				/>
				{data?.status ? <TemplateStatusBadge status={data.status} /> : null}
			</div>
		</div>
	);
};
