"use server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { AuthError } from "next-auth";

/**
 * Updates the verification status of a user
 * @param userId - The ID of the user to update
 * @param isVerified - The new verification status
 * @returns Promise<boolean> - Success status
 */
export async function updateUserVerification(userId: string, isVerified: boolean): Promise<boolean> {
  try {
    const session = await auth();
    
    // Only allow verified users to update verification status (admin functionality)
    if (!session || !session.user.is_verified) {
      throw new AuthError("Not authorized to update user verification");
    }

    const sql = neon(process.env.DATABASE_URL || "");

    // Update the user's verification status
    const result = await sql`
      UPDATE users 
      SET is_verified = ${isVerified}
      WHERE id = ${userId}
    `;

    return true;
  } catch (error) {
    console.error("Error updating user verification:", error);
    return false;
  }
}

/**
 * Gets the current user's verification status
 * @returns Promise<boolean | null> - Verification status or null if not authenticated
 */
export async function getCurrentUserVerificationStatus(): Promise<boolean | null> {
  try {
    const session = await auth();
    
    if (!session) {
      return null;
    }

    return session.user.is_verified || false;
  } catch (error) {
    console.error("Error getting user verification status:", error);
    return null;
  }
}

/**
 * Lists all users with their verification status (admin only)
 * @returns Promise<Array<{id: string, name: string, email: string, is_verified: boolean}> | null>
 */
export async function listUsersWithVerificationStatus() {
  try {
    const session = await auth();
    
    // Only allow verified users to view all users (admin functionality)
    if (!session || !session.user.is_verified) {
      throw new AuthError("Not authorized to view user list");
    }

    const sql = neon(process.env.DATABASE_URL || "");

    const result = await sql`
      SELECT id, name, email, is_verified
      FROM users
      ORDER BY name
    `;

    return result;
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}
