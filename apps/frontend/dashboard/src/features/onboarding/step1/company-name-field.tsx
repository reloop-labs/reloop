import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { motion } from "framer-motion";
import { parseAsString, useQueryState } from "nuqs";

export function CompanyNameField() {
	const [name, setName] = useQueryState("name", parseAsString.withDefault(""));

	return (
		<motion.div layout className="flex flex-col gap-1">
			<Label.Root htmlFor="company-name">Company name</Label.Root>
			<Input.Root size="small" className="rounded-xl">
				<Input.Wrapper>
					<Input.Input
						id="company-name"
						type="text"
						value={name}
						className="font-medium"
						onChange={(e) => {
							setName(e.target.value);
						}}
						placeholder="e.g. Acme Corp"
					/>
				</Input.Wrapper>
			</Input.Root>
		</motion.div>
	);
}
