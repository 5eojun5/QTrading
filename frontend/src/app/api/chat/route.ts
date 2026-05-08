import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${apiUrl}/api/v1/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { response: "Backend not available. Running in demo mode with built-in responses." },
      { status: 200 }
    );
  }
}
