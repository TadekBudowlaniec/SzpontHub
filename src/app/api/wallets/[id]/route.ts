import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/wallets/[id] - pobierz szczegóły portfela
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: wallet, error } = await supabaseAdmin
      .from("Wallet")
      .select(`
        *,
        transactions:Transaction(*)
      `)
      .eq("id", id)
      .eq("userId", user.id)
      .single();

    if (error || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/wallets/[id] - zaktualizuj portfel
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Sprawdź czy portfel należy do użytkownika
    const { data: existingWallet } = await supabaseAdmin
      .from("Wallet")
      .select("id")
      .eq("id", id)
      .eq("userId", user.id)
      .single();

    if (!existingWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const { data: wallet, error } = await supabaseAdmin
      .from("Wallet")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/wallets/[id] - usuń portfel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Sprawdź czy portfel należy do użytkownika
    const { data: existingWallet } = await supabaseAdmin
      .from("Wallet")
      .select("id")
      .eq("id", id)
      .eq("userId", user.id)
      .single();

    if (!existingWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("Wallet")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
