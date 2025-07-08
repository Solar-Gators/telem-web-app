import { Pool } from "@neondatabase/serverless";

// Helper function to update user verification status
export async function updateUserVerification(
  userId: string,
  isVerified: boolean,
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query("UPDATE users SET is_verified = $1 WHERE id = $2", [
      isVerified,
      userId,
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error updating user verification:", error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}

// Helper function to get user verification status
export async function getUserVerificationStatus(userId: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      "SELECT is_verified FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      isVerified: result.rows[0].is_verified,
    };
  } catch (error) {
    console.error("Error getting user verification status:", error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}

// Helper function to list all users and their verification status (admin use)
export async function getAllUsersVerificationStatus() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      "SELECT id, name, email, is_verified FROM users ORDER BY name",
    );

    return {
      success: true,
      users: result.rows,
    };
  } catch (error) {
    console.error("Error getting all users verification status:", error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}
