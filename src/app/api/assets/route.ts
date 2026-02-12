import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/assets - pobierz wszystkie aktywa użytkownika
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: assets, error } = await supabaseAdmin
      .from("Asset")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching assets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Oblicz wartość każdego aktywa
    const assetsWithValue = assets?.map((asset) => ({
      ...asset,
      totalValue: asset.quantity * asset.currentPrice,
    })) || [];

    return NextResponse.json(assetsWithValue);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/assets - dodaj nowe aktywo
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, symbol, quantity, currentPrice } = body;

    if (!name || !symbol || quantity === undefined || currentPrice === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: asset, error } = await supabaseAdmin
      .from("Asset")
      .insert({
        userId: user.id,
        name,
        symbol: symbol.toUpperCase(),
        quantity,
        currentPrice,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating asset:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
