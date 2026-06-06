import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("benevolence_people")
    .select("id, full_name, current_address, cell_phone, home_phone")
    .eq("is_demo_data", false)
    .ilike("full_name", `%${query}%`)
    .order("full_name", { ascending: true })
    .limit(8);

  if (error) {
    return NextResponse.json(
      { error: "Unable to search households." },
      { status: 500 },
    );
  }

  return NextResponse.json({ results: data ?? [] });
}
