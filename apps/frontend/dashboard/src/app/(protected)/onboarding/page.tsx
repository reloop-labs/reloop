import Spinner from "@reloop/ui/spinner";
import { Suspense } from "react";
import { OnBoardingContent } from "./onboarding-content";

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
