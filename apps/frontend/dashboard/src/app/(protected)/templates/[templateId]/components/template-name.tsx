"use client";

import { Icon } from "@reloop/ui/icon";
import * as StatusBadge from "@reloop/ui/status-badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import { useDebounceCallback } from "usehooks-ts";

const fetcher = (url: string) =>
	fetch(url, { credentials: "include" }).then((res) => res.json());

export const TemplateName = () => {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;

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

	useEffect(() => {
		if (measureRef.current && inputRef.current) {
			// Add a small buffer to prevent jitter
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
		return (
			<div className="h-7 w-48 animate-pulse rounded-md bg-bg-weak-50 dark:bg-white/5" />
		);
	}

	return (
		<div className="flex items-center">
			<div className="flex items-center gap-1.5">
				<Icon name="layout" className="size-4 text-text-sub-600" />
				<Link
					href="/templates"
					className="font-medium text-sm hover:text-text-strong-950"
				>
					Templates
				</Link>
			</div>

			<span className="ml-2.5 text-text-disabled-300 text-xs">/</span>

			<div className="group ml-1 flex items-center">
				<span
					ref={measureRef}
					className="invisible absolute whitespace-pre px-2 py-1 font-bold text-sm"
					aria-hidden="true"
				>
					{name || "Template name"}
				</span>
				<input
					ref={inputRef}
					value={name}
					onChange={handleChange}
					placeholder="Template name"
					className="rounded-md bg-transparent px-2 py-1 font-bold text-sm text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 hover:bg-bg-weak-50 focus:ring-0 dark:text-white dark:hover:bg-white/5"
				/>
				{data?.status && (
					<div className="flex items-center rounded-md border border-stroke-soft-200 bg-bg-weak-50/50 px-2 font-medium text-xs dark:bg-bg-weak-50/50">
						{data.status}
					</div>
				)}
			</div>
		</div>
	);
};
