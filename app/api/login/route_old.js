// app/api/login/route.js
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const [rows] = await db.query(
      "SELECT * FROM admin WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) {
      return Response.json({ success: true, message: "Login berhasil" }, { status: 200 });
    } else {
      return Response.json({ success: false, message: "Username atau password salah" }, { status: 401 });
    }
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
