import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  // Create a `Pool` inside the request handler.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return {
    adapter: NeonAdapter(pool),
    providers: [Google],
    callbacks: {
      async session({ session, user }) {
        // When using database adapter, user contains the database user object
        // Add is_verified to session from database user
        if (session?.user && user) {
          session.user.is_verified = user.is_verified ?? false;
        }
        return session;
      },
    },
  };
});
