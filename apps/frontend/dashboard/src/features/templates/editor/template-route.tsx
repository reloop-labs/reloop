"use client";

import { Icon } from "@reloop/ui/icon";
import { NotFoundIllustration } from "@reloop/ui/not-found-illustration";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { isTemplateId } from "../lib/template-href";
import { TemplateIdContext } from "./hooks/use-template-id";
import { TemplateEditorPage } from "./template-editor-page";

type TemplateRef = { id: string; slug: string };

class TemplateNotFoundError extends Error {}

/** Same cache entry the editor's `useSWR(`/api/template/v1/${id}`)` reads. */
const detailKey = (id: string) =>
	["template-editor", `/api/template/v1/${id}`] as const;

async function fetchTemplate(url: string): Promise<TemplateRef> {
	const res = await fetch(url, { credentials: "include" });
	if (res.status === 404) throw new TemplateNotFoundError();
	if (!res.ok) throw new Error(`Failed to load template (${res.status})`);
	return res.json();
}

/**
 * `/templates/welcome-email` and `/templates/tmpl_…` both open the editor.
 * The slug is resolved to the ID once; everything below works on the ID, and
 * the address bar is kept on the current slug.
 */
export function TemplateRoute({ param }: { param: string }) {
	const queryClient = useQueryClient();
	// Every slug/ID that has pointed at the open template. The URL segment may
	// lag or change after a rename; none of those should reload the editor.
	const aliases = useRef(new Map<string, string>());

	const knownId = isTemplateId(param) ? param : aliases.current.get(param);

	const bySlug = useQuery({
		queryKey: ["template-editor", "slug", param],
		queryFn: async () => {
			const template = await fetchTemplate(
				`/api/template/v1/slug/${encodeURIComponent(param)}`,
			);
			queryClient.setQueryData(detailKey(template.id), template);
			return template;
		},
		enabled: !knownId,
		staleTime: 0,
		gcTime: 0,
		retry: (count, error) =>
			!(error instanceof TemplateNotFoundError) && count < 2,
	});

	const id = knownId ?? bySlug.data?.id;
	if (id) aliases.current.set(param, id);

	const detail = useQuery({
		queryKey: detailKey(id ?? ""),
		queryFn: () => fetchTemplate(`/api/template/v1/${id}`),
		enabled: !!id,
		retry: (count, error) =>
			!(error instanceof TemplateNotFoundError) && count < 2,
	});
	const slug = detail.data?.slug;

	// Keep `/templates/<slug>` in the address bar as the slug changes
	// (draft renames, manual edits, or arriving via an ID link).
	useEffect(() => {
		if (!id || !slug) return;
		aliases.current.set(slug, id);
		const segments = window.location.pathname.split("/");
		if (decodeURIComponent(segments.at(-1) ?? "") === slug) return;
		segments[segments.length - 1] = encodeURIComponent(slug);
		// replaceState: no reload, no extra back-button entry.
		window.history.replaceState(
			window.history.state,
			"",
			`${segments.join("/")}${window.location.search}${window.location.hash}`,
		);
	}, [id, slug]);

	if (
		bySlug.error instanceof TemplateNotFoundError ||
		detail.error instanceof TemplateNotFoundError
	) {
		return <TemplateNotFound />;
	}
	if (!id) return null;

	return (
		<TemplateIdContext.Provider value={id}>
			<TemplateEditorPage templateId={id} />
		</TemplateIdContext.Provider>
	);
}

function TemplateNotFound() {
	return (
		<div className="flex min-h-[calc(100dvh-8rem)] flex-1 flex-col items-center justify-center px-4 py-16 text-center">
			<NotFoundIllustration className="mb-6" />
			<h1 className="mb-2 font-semibold text-lg text-text-strong-950 dark:text-white">
				Template not found
			</h1>
			<p className="text-sm text-text-sub-600 dark:text-white/50">
				It may have been renamed or deleted.
			</p>
			<div className="mt-8">
				<Link
					href="/templates"
					className="inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-[#0a0d12] pr-8 pl-6 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
				>
					<Icon name="arrow-left" className="size-4" aria-hidden />
					Back to all templates
				</Link>
			</div>
		</div>
	);
}
