import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/transactions - pobierz wszystkie transakcje użytkownika
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get("walletId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Najpierw pobierz portfele użytkownika
    const { data: userWallets } = await supabaseAdmin
      .from("Wallet")
      .select("id")
      .eq("userId", user.id);

    if (!userWallets || userWallets.length === 0) {
      return NextResponse.json([]);
    }

    const walletIds = userWallets.map((w) => w.id);

    let query = supabaseAdmin
      .from("Transaction")
      .select(`
        *,
        wallet:Wallet(name, color, icon)
      `)
      .in("walletId", walletIds)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (walletId) {
      query = query.eq("walletId", walletId);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/transactions - utwórz nową transakcję
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { walletId, amount, type, category, description, date } = body;

    if (!walletId || amount === undefined || !type || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sprawdź czy portfel należy do użytkownika
    const { data: wallet } = await supabaseAdmin
      .from("Wallet")
      .select("id, balance")
      .eq("id", walletId)
      .eq("userId", user.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Utwórz transakcję
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("Transaction")
      .insert({
        walletId,
        amount,
        type,
        category,
        description,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    // Zaktualizuj saldo portfela
    const newBalance = type === "income"
      ? wallet.balance + amount
      : wallet.balance - amount;

    await supabaseAdmin
      .from("Wallet")
      .update({ balance: newBalance })
      .eq("id", walletId);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
