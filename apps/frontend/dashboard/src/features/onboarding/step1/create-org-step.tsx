import * as FancyButton from "@reloop/ui/fancy-button";
import Spinner from "@reloop/ui/spinner";
import { motion } from "framer-motion";
import { CompanyNameField } from "./company-name-field";
import { LogoUpload } from "./logo-upload";
import { ReferralField } from "./referral-field";
import { useCreateOrg } from "./use-create-org";
import { useLogoUpload } from "./use-logo-upload";

export function CreateOrgStep() {
	const {
		fileInputRef,
		isUploading,
		logoPreview,
		logoUrl,
		openFilePicker,
		onFileChange,
	} = useLogoUpload();

	const {
		isCreating,
		name,
		orgId,
		referral,
		otherReferral,
		createAndContinue,
	} = useCreateOrg();

	const canSubmit =
		Boolean(name) &&
		!isUploading &&
		!isCreating &&
		!(referral === "other" && !otherReferral);

	return (
		<div>
			<h1 className="mb-4 font-semibold text-[26px] text-text-strong-950 tracking-tight">
				Create your workspace
			</h1>
			<LogoUpload
				fileInputRef={fileInputRef}
				isUploading={isUploading}
				logoPreview={logoPreview}
				logoUrl={logoUrl}
				onFileChange={onFileChange}
				onUploadClick={openFilePicker}
			/>

			<motion.div layout className="space-y-3.5 pt-6">
				<CompanyNameField />
				<ReferralField />
			</motion.div>

			<FancyButton.Root
				variant="blue"
				size="medium"
				className="mt-6 w-full rounded-xl"
				onClick={createAndContinue}
				disabled={!canSubmit}
			>
				{isCreating ? (
					<>
						<Spinner size={16} color="var(--text-white-0)" />
						Creating...
					</>
				) : orgId ? (
					"Continue"
				) : (
					"Create workspace"
				)}
			</FancyButton.Root>
		</div>
	);
}
