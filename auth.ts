import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import NeonAdapter from "@auth/neon-adapter"
import { Pool } from "@neondatabase/serverless"

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  // Create a `Pool` inside the request handler.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return {
    adapter: NeonAdapter(pool),
    providers: [
      Google({
        profile(profile) {
          return { 
            is_verified: profile.is_verified ?? false, 
            ...profile 
          }
        },
      }),
    ],
    callbacks: {
      session({ session, user }) {
        session.user.is_verified = user.is_verified
        return session
      },
    },
  }
})
