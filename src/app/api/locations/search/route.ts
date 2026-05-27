import { NextResponse } from "next/server";
import { searchLocations } from "@/lib/location/nominatim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchLocations(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json({ error: "Location search failed" }, { status: 500 });
  }
}
