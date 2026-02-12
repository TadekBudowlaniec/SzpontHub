import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/wallets - pobierz wszystkie portfele użytkownika
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: wallets, error } = await supabaseAdmin
      .from("Wallet")
      .select(`
        *,
        transactions:Transaction(*)
      `)
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching wallets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/wallets - utwórz nowy portfel
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, balance, currency, color, icon } = body;

    if (!name || !type || !color || !icon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: wallet, error } = await supabaseAdmin
      .from("Wallet")
      .insert({
        userId: user.id,
        name,
        type,
        balance: balance || 0,
        currency: currency || "PLN",
        color,
        icon,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating wallet:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
