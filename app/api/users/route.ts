import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || "");
    const result = await sql`SELECT * FROM users ORDER BY id DESC`;
    return NextResponse.json({ users: result });
  } catch {
    return NextResponse.json(
      { error: "failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, is_verified } = await request.json();
    const sql = neon(process.env.DATABASE_URL || "");
    const result =
      await sql`UPDATE USERS SET is_verified = ${is_verified} WHERE id = ${id} RETURNING *`;
    return NextResponse.json({ user: result[0] });
  } catch {
    return NextResponse.json(
      { error: "failed to update users" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const sql = neon(process.env.DATABASE_URL || "");
    const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING ID`;
    return NextResponse.json({ message: "User has been deleted" });
  } catch {
    return NextResponse.json(
      { error: "failed to delete user" },
      { status: 500 }
    );
  }
}
