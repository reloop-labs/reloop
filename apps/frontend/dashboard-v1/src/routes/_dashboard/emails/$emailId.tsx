import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { Icon } from "@reloop/ui/icon";

export const Route = createFileRoute("/_dashboard/emails/$emailId")({
	component: EmailDetailPlaceholder,
	head: () => ({
		meta: [
			{ title: "Email Detail · Reloop" },
			{ name: "description", content: "View email delivery details." },
		],
	}),
});

function EmailDetailPlaceholder() {
	const { emailId } = Route.useParams();

	return (
		<div className="pt-10 pb-8">
			<AnimatedBackButton />
			<div className="mt-10 flex flex-col items-center gap-3 py-16 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0">
					<Icon name="mail-single" className="h-5 w-5 text-text-sub-600" />
				</div>
				<h2 className="font-medium text-lg text-text-strong-950">
					Email detail coming soon
				</h2>
				<p className="max-w-sm text-sm text-text-sub-600">
					Delivery timeline for{" "}
					<code className="rounded bg-neutral-alpha-10 px-1.5 py-0.5 font-mono text-xs">
						{emailId.slice(0, 12)}…
					</code>{" "}
					will be ported next.
				</p>
				<Link
					to="/emails/sent"
					className="mt-2 font-medium text-sm text-primary-base underline-offset-2 hover:underline"
				>
					Back to sent emails
				</Link>
			</div>
		</div>
	);
}
