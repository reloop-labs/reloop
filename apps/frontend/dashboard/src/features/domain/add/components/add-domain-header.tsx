import { useNavigate } from "#/lib/navigation";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";

export function AddDomainHeader() {
	const navigate = useNavigate();

	return (
		<div className="pt-4 pb-4">
			<AnimatedBackButton onClick={() => void navigate({ to: "/domain" })} />
			<div className="pt-4">
				<h1 className="font-semibold text-title-h6 leading-8">Add Domain</h1>
				<p className="text-text-sub-600 text-xs">
					Send emails from a domain you control
				</p>
			</div>
		</div>
	);
}
