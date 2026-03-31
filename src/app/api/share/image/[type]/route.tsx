import { NextRequest, NextResponse } from "next/server";
import { publicConfig } from "@/config/public-config";

// Cache for 1 hour - query strings create separate cache entries
export const revalidate = 3600;

const { heroImageUrl, imageUrl } = publicConfig;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const directImageUrl = type === "og" ? heroImageUrl : imageUrl;
  return NextResponse.redirect(directImageUrl, { status: 302 });
}
