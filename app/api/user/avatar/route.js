import { getUserAvatar } from "@/actions/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const avatarUrl = await getUserAvatar();
    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Error fetching user avatar:", error);
    return NextResponse.json({ error: "Failed to fetch avatar" }, { status: 500 });
  }
}