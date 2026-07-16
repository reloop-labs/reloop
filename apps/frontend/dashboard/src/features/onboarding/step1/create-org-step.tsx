import * as Button from "@reloop/ui/button";
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

			<Button.Root
				variant="neutral"
				className="mt-6 w-full"
				mode="filled"
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
			</Button.Root>
		</div>
	);
}
