import type { EmailTemplateExample } from "@reloop/email-templates";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
	createTemplate,
	type Template,
	useInvalidateTemplates,
} from "./use-templates-query";

/** Subject from `<title>`, preview text from the hidden preheader div. */
function readEmailMeta(html: string): { subject: string; previewText: string } {
	const doc = new DOMParser().parseFromString(html, "text/html");
	const subject = doc.querySelector("title")?.textContent?.trim() ?? "";
	const preheader = Array.from(doc.body.querySelectorAll("div")).find((el) =>
		/display\s*:\s*none/i.test(el.getAttribute("style") ?? ""),
	);
	return { subject, previewText: preheader?.textContent?.trim() ?? "" };
}

async function createTemplateFromExample(
	example: EmailTemplateExample,
): Promise<Template> {
	// Assets like the Acme logo are served by the web app on the same origin.
	const html = example.html(window.location.origin);
	const { subject, previewText } = readEmailMeta(html);

	// A single `{ html }` block, which the editor imports on first open — the
	// same shape the public editor hands off.
	const created = await createTemplate({
		name: example.name,
		subject: subject.slice(0, 500) || undefined,
		content: [{ id: crypto.randomUUID(), type: "html", props: {}, html }],
	});

	// Create only takes the basics; preview text and variable defaults go on
	// with an update.
	const updateRes = await fetch(`/api/template/v1/${created.id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ previewText, variables: example.variables }),
	});
	if (!updateRes.ok) {
		// The template exists with its content; missing defaults are not worth
		// failing over.
		console.error(
			`Failed to apply example details to template (${updateRes.status})`,
		);
	}

	return created;
}

/** Copy a gallery template into the workspace and open it in the editor. */
export function useCreateTemplateFromExample() {
	const router = useRouter();
	const invalidate = useInvalidateTemplates();
	const [pendingId, setPendingId] = useState<string | null>(null);

	const createFromExample = useCallback(
		async (example: EmailTemplateExample) => {
			if (pendingId) return;
			setPendingId(example.id);
			try {
				const template =
					example.id === "blank"
						? await createTemplate()
						: await createTemplateFromExample(example);
				await invalidate();
				router.push(`/templates/${template.id}`);
			} catch (error) {
				console.error("Failed to create template from example:", error);
				toast.error("Failed to use this template. Please try again.");
				setPendingId(null);
			}
		},
		[pendingId, invalidate, router],
	);

	return { pendingId, createFromExample };
}
