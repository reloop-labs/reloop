"use client";

const TemplatesLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div>
			<div>
				<div>{children}</div>
			</div>
		</div>
	);
};

export default TemplatesLayout;
