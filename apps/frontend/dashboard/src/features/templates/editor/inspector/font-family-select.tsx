import { SelectField } from "./select-field";

export const EMAIL_SAFE_FONTS = [
	{ label: "Arial", value: "Arial, Helvetica, sans-serif" },
	{ label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
	{ label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
	{ label: "Inter", value: "Inter, Arial, sans-serif" },
	{ label: "Lato", value: "Lato, Arial, sans-serif" },
	{ label: "Montserrat", value: "Montserrat, Arial, sans-serif" },
	{ label: "Open Sans", value: "'Open Sans', Arial, sans-serif" },
	{ label: "Roboto", value: "Roboto, Arial, sans-serif" },
	{ label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
	{ label: "Times New Roman", value: "'Times New Roman', Times, serif" },
	{ label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
	{ label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

export function FontFamilySelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<SelectField
			value={value}
			onChange={onChange}
			options={EMAIL_SAFE_FONTS}
			placeholder="Default"
		/>
	);
}
