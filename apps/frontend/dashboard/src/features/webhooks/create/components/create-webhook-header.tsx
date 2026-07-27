import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { useNavigate } from "#/lib/navigation";

export function CreateWebhookHeader() {
	const navigate = useNavigate();

	return (
		<div className="pt-6">
			<AnimatedBackButton onClick={() => void navigate({ to: "/webhooks" })} />
			<div className="pt-4">
				<h1 className="font-semibold text-text-strong-950 text-title-h6 leading-8">
					Add webhook
				</h1>
				<p className="font-medium text-paragraph-sm text-text-sub-600">
					Send event notifications to your server in real time.
				</p>
			</div>
		</div>
	);
}
