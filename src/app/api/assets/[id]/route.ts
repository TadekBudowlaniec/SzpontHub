import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/assets/[id] - pobierz szczegóły aktywa
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

    const { data: asset, error } = await supabaseAdmin
      .from("Asset")
      .select("*")
      .eq("id", id)
      .eq("userId", user.id)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...asset,
      totalValue: asset.quantity * asset.currentPrice,
    });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/assets/[id] - zaktualizuj aktywo
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

    // Sprawdź czy aktywo należy do użytkownika
    const { data: existingAsset } = await supabaseAdmin
      .from("Asset")
      .select("id")
      .eq("id", id)
      .eq("userId", user.id)
      .single();

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const { data: asset, error } = await supabaseAdmin
      .from("Asset")
      .update({
        ...(body.name && { name: body.name }),
        ...(body.symbol && { symbol: body.symbol.toUpperCase() }),
        ...(body.quantity !== undefined && { quantity: body.quantity }),
        ...(body.currentPrice !== undefined && { currentPrice: body.currentPrice }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ...asset,
      totalValue: asset.quantity * asset.currentPrice,
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/assets/[id] - usuń aktywo
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

    // Sprawdź czy aktywo należy do użytkownika
    const { data: existingAsset } = await supabaseAdmin
      .from("Asset")
      .select("id")
      .eq("id", id)
      .eq("userId", user.id)
      .single();

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("Asset")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
