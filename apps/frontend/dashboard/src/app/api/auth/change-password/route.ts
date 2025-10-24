import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

export async function POST(request: NextRequest) {
	try {
		const body: ChangePasswordRequest = await request.json();
		const { currentPassword, newPassword } = body;

		// Validate input
		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{ error: "Current password and new password are required" },
				{ status: 400 },
			);
		}

		if (newPassword.length < 8) {
			return NextResponse.json(
				{ error: "New password must be at least 8 characters long" },
				{ status: 400 },
			);
		}

		if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			return NextResponse.json(
				{
					error:
						"New password must contain at least one uppercase letter, one lowercase letter, and one number",
				},
				{ status: 400 },
			);
		}

		if (currentPassword === newPassword) {
			return NextResponse.json(
				{ error: "New password must be different from current password" },
				{ status: 400 },
			);
		}

		// TODO: Implement actual password change with Better Auth
		// For now, simulate the process
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock validation - in real implementation, verify current password
		if (currentPassword === "wrongpassword") {
			return NextResponse.json(
				{ error: "Current password is incorrect" },
				{ status: 400 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to change password" },
			{ status: 500 },
		);
	}
}
