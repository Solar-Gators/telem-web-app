import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Attempting to fetch users from the database via API...");
    console.log(
      "Connecting to Neon database with URL:",
      process.env.DATABASE_URL || "undefined"
    );
    const sql = neon(process.env.DATABASE_URL || "");
    console.log("Database connection established.");

    console.log("Executing query to fetch users...");
    const result = await sql`
      SELECT * FROM users
      ORDER BY id DESC
    `;
    console.log("Query executed, results:", result.length, "users found.");

    if (result.length === 0) {
      return NextResponse.json({ users: [] });
    }

    return NextResponse.json({ users: result });
  } catch (error) {
    console.error("Error fetching users via API:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: "Failed to fetch users", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, is_verified } = await request.json();
    console.log(`Attempting to update user with ID: ${id}`);
    console.log(
      "Connecting to Neon database with URL:",
      process.env.DATABASE_URL || "undefined"
    );
    const sql = neon(process.env.DATABASE_URL || "");
    console.log("Database connection established.");

    console.log("Executing update query...");
    const result = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, is_verified = ${is_verified}
      WHERE id = ${id}
      RETURNING *
    `;
    console.log("Update query executed, result:", result);

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error("Error updating user via API:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: "Failed to update user", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    console.log(`Attempting to delete user with ID: ${id}`);
    console.log(
      "Connecting to Neon database with URL:",
      process.env.DATABASE_URL || "undefined"
    );
    const sql = neon(process.env.DATABASE_URL || "");
    console.log("Database connection established.");

    console.log("Executing delete query...");
    const result = await sql`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING id
    `;
    console.log("Delete query executed, result:", result);

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user via API:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: "Failed to delete user", details: errorMessage },
      { status: 500 }
    );
  }
}
