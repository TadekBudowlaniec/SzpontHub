import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Brakujące dane", { status: 400 });
    }

    // Utwórz użytkownika przez Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatycznie potwierdź email
      user_metadata: {
        name,
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      if (authError.message.includes("already")) {
        return new NextResponse("Email już istnieje", { status: 400 });
      }
      return new NextResponse(authError.message, { status: 400 });
    }

    // Dodaj użytkownika do tabeli User
    const { error: dbError } = await supabaseAdmin
      .from("User")
      .insert({
        id: authData.user.id,
        email,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Usuń użytkownika z auth jeśli nie udało się dodać do bazy
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new NextResponse("Błąd bazy danych", { status: 500 });
    }

    return NextResponse.json({
      message: "Konto utworzone pomyślnie",
      user: { id: authData.user.id, email, name }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return new NextResponse(error.message || "Błąd serwera", { status: 500 });
  }
}
