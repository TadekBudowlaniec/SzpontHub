import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Tutaj musimy użyć service_role key, żeby móc utworzyć użytkownika
// pomijając RLS (Row Level Security) jeśli jest włączone
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data, error } = await supabaseAdmin
      .from('User')
      .insert({
        email,
        name,
        password: hashedPassword,
        image: '',
        emailVerified: null
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return new NextResponse("User exists or error", { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}