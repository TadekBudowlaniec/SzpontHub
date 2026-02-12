import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Używamy bezpośredniego zapytania HTTP do Supabase dla logowania, 
// żeby nie importować klienta w tym pliku jeśli nie trzeba
export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Musimy ręcznie sprawdzić użytkownika w bazie Supabase
        // Używamy fetch, żeby nie tworzyć tutaj klienta
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?email=eq.${credentials.email}&select=*`, {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
          }
        });

        const users = await response.json();
        const user = users?.[0];

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};