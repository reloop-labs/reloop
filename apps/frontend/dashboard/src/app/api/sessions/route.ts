import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		// TODO: Implement actual session fetching from Better Auth
		// For now, return mock data
		const mockSessions = [
			{
				id: "1",
				device: "macOS",
				browser: "Chrome 138.0.0.0",
				location: "Vancouver, Canada",
				ipAddress: "224.0.1.1",
				createdAt: new Date().toISOString(),
				lastActiveAt: new Date().toISOString(),
				isCurrent: true,
			},
			{
				id: "2",
				device: "iOS",
				browser: "Mobile Safari 18.5",
				location: "Québec, Canada",
				ipAddress: "226.0.1.1",
				createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
				lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "3",
				device: "Windows",
				browser: "Mozilla Firefox 120.0",
				location: "Paris, France",
				ipAddress: "227.0.1.1",
				createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
				lastActiveAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "4",
				device: "Linux",
				browser: "Google Chrome 119.0",
				location: "Berlin, Germany",
				ipAddress: "228.0.1.1",
				createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
				lastActiveAt: new Date(
					Date.now() - 1 * 24 * 60 * 60 * 1000,
				).toISOString(),
			},
			{
				id: "5",
				device: "Android",
				browser: "Chrome Mobile 119.0",
				location: "Tokyo, Japan",
				ipAddress: "229.0.1.1",
				createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
				lastActiveAt: new Date(
					Date.now() - 2 * 24 * 60 * 60 * 1000,
				).toISOString(),
			},
		];

		return NextResponse.json({ sessions: mockSessions });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch sessions" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get("sessionId");

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 },
			);
		}

		// TODO: Implement actual session termination with Better Auth
		// await authClient.terminateSession({ sessionId });

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to terminate session" },
			{ status: 500 },
		);
	}
}
