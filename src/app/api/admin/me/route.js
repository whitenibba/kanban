import pool from "@/lib/db";
import { getAdminIdFromCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const adminId = await getAdminIdFromCookies();
    if (!adminId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const [rows] = await pool.query(
            "SELECT id_admin, name, email FROM ADMIN WHERE id_admin = ?",
            [adminId]
        );
        return new Response(JSON.stringify(rows[0]), { status: 200 });
    } catch (error) {
        console.error("Database query error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}