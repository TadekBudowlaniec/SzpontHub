import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Brakujące dane", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. Sprawdź czy user istnieje
    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        return new NextResponse("Email już istnieje", { status: 400 });
    }

    // 2. Utwórz usera w tabeli users (Nasza własna tabela)
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        // Generujemy ID lub pozwalamy bazie (jeśli używasz uuid)
        // Lepiej użyć ID z Supabase Auth jeśli integrujesz, 
        // ale przy Credentials Provider możemy generować własne:
        id: crypto.randomUUID(), 
        email,
        name,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new NextResponse("Błąd bazy danych", { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Registration error:", error);
    return new NextResponse("Błąd serwera", { status: 500 });
  }
}