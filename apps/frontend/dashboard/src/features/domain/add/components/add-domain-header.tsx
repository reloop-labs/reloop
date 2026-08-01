import { useRouter } from "next/navigation";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";

export function AddDomainHeader() {
	const router = useRouter();

	return (
		<div className="pt-4 pb-4">
			<AnimatedBackButton onClick={() => router.push("/domain")} />
			<div className="pt-4">
				<h1 className="font-semibold text-title-h6 leading-8">Add Domain</h1>
				<p className="text-text-sub-600 text-xs">
					Send emails from a domain you control
				</p>
			</div>
		</div>
	);
}
