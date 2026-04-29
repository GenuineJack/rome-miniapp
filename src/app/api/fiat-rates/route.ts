import { NextResponse } from "next/server";

const ALLOWED_BASES = new Set(["USD", "EUR", "GBP"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base") ?? "USD";

  if (!ALLOWED_BASES.has(base)) {
    return NextResponse.json({ error: "Invalid base currency" }, { status: 400 });
  }

  const res = await fetch(`https://api.frankfurter.app/latest?base=${base}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Upstream rates unavailable" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
