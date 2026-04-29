import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { publicConfig } from "@/config/public-config";

// Cache for 1 hour - query strings create separate cache entries
export const revalidate = 3600;

const { heroImageUrl, imageUrl } = publicConfig;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;

  if (type === "og") {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") ?? "";
    const title = searchParams.get("title") ?? "The Dispatch · Boston";

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            background: "#091f2f",
            padding: "60px",
            fontFamily: "Georgia, serif",
          }}
        >
          {/* Decorative rule */}
          <div style={{ width: "48px", height: "4px", background: "#1871bd", marginBottom: "20px" }} />

          {date && (
            <div style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)", fontFamily: "Arial, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>
              {date}
            </div>
          )}

          <div style={{ fontSize: "64px", fontWeight: 900, color: "#ffffff", lineHeight: 1.1, marginBottom: "16px" }}>
            {title}
          </div>

          <div style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
            Boston, today.
          </div>

          {/* Bottom brand */}
          <div style={{ position: "absolute", top: "52px", right: "60px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontFamily: "Arial, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>
              /boston
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }

  return NextResponse.redirect(imageUrl, {
    status: 302,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
