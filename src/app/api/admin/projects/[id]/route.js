import pool from '@/lib/db';
import { getAdminIdFromCookies } from '@/lib/auth';
import { NextResponse } from 'next/server';

// 1. OTTENERE IL PROGETTO (GET)
export async function GET(request, { params }) {
    const { id } = await params; // Recuperiamo l'ID dalle quadre
    try {
        const [rows] = await pool.query(
            "SELECT * FROM PROJECT WHERE id_project = ? AND is_deleted = 0", 
            [id]
        );
        return NextResponse.json(rows[0] || { error: "Progetto non trovato" });
    } catch (error) {
        return NextResponse.json({ error: "Errore server" }, { status: 500 });
    }
}

// 2. MODIFICARE IL PROGETTO (PUT)
export async function PUT(request, { params }) {
    const { id } = await params;
    const { name, description } = await request.json(); // Leggiamo i nuovi dati
    try {
        await pool.query(
            "UPDATE PROJECT SET name = ?, description = ? WHERE id_project = ?",
            [name, description, id]
        );
        return NextResponse.json({ message: "Progetto aggiornato con successo" });
    } catch (error) {
        return NextResponse.json({ error: "Errore aggiornamento" }, { status: 500 });
    }
}

// 3. ELIMINARE IL PROGETTO (DELETE)
export async function DELETE(request, { params }) {
    const adminId = await getAdminIdFromCookies();
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const projectId = resolvedParams.id;

        // Verifica che il progetto appartiene all'admin
        const [projectCheck] = await pool.query(
            "SELECT id_project FROM PROJECT WHERE id_project = ? AND id_admin = ? AND is_deleted = FALSE",
            [projectId, adminId]
        );

        if (projectCheck.length === 0) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Esegui soft delete
        await pool.query(
            "UPDATE PROJECT SET is_deleted = 1 WHERE id_project = ?",
            [projectId]
        );

        return NextResponse.json({ message: "Progetto eliminato con successo" });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}