import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "pending",
    message:
      "Contract address not yet configured. Set FARCON_CONTRACT_ADDRESS env var to enable sync.",
  });
}
