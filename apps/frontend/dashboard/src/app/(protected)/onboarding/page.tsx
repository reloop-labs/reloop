import Spinner from "@reloop/ui/spinner";
import { Suspense } from "react";
import { OnBoardingContent } from "./onboarding-content";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const OnBoardingPage = () => (
	<Suspense
		fallback={
			<div className="flex min-h-screen items-center justify-center">
				<Spinner size={32} />
			</div>
		}
	>
		<OnBoardingContent />
	</Suspense>
);

export default OnBoardingPage;
