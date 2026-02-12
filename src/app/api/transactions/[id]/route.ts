import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/transactions/[id] - pobierz szczegóły transakcji
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

    const { data: transaction, error } = await supabaseAdmin
      .from("Transaction")
      .select(`
        *,
        wallet:Wallet(id, name, color, icon, userId)
      `)
      .eq("id", id)
      .single();

    if (error || !transaction || transaction.wallet?.userId !== user.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/transactions/[id] - zaktualizuj transakcję
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

    // Pobierz istniejącą transakcję z portfelem
    const { data: existingTransaction } = await supabaseAdmin
      .from("Transaction")
      .select(`
        *,
        wallet:Wallet(id, balance, userId)
      `)
      .eq("id", id)
      .single();

    if (!existingTransaction || existingTransaction.wallet?.userId !== user.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Oblicz zmianę salda
    const oldAmount = existingTransaction.type === "income"
      ? existingTransaction.amount
      : -existingTransaction.amount;

    const newType = body.type || existingTransaction.type;
    const newAmount = body.amount !== undefined ? body.amount : existingTransaction.amount;
    const newBalanceEffect = newType === "income" ? newAmount : -newAmount;
    const balanceDiff = newBalanceEffect - oldAmount;

    // Zaktualizuj transakcję
    const { data: transaction, error: updateError } = await supabaseAdmin
      .from("Transaction")
      .update({
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.type && { type: body.type }),
        ...(body.category && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.date && { date: body.date }),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Zaktualizuj saldo portfela
    await supabaseAdmin
      .from("Wallet")
      .update({ balance: existingTransaction.wallet.balance + balanceDiff })
      .eq("id", existingTransaction.walletId);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/transactions/[id] - usuń transakcję
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

    // Pobierz transakcję do usunięcia
    const { data: transaction } = await supabaseAdmin
      .from("Transaction")
      .select(`
        *,
        wallet:Wallet(id, balance, userId)
      `)
      .eq("id", id)
      .single();

    if (!transaction || transaction.wallet?.userId !== user.id) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Oblicz zmianę salda (cofnij efekt transakcji)
    const balanceChange = transaction.type === "income"
      ? -transaction.amount
      : transaction.amount;

    // Usuń transakcję
    const { error: deleteError } = await supabaseAdmin
      .from("Transaction")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Zaktualizuj saldo portfela
    await supabaseAdmin
      .from("Wallet")
      .update({ balance: transaction.wallet.balance + balanceChange })
      .eq("id", transaction.walletId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
