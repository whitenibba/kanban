import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: "Logout effettuato" });

    // Eliminiamo il cookie impostando la data di scadenza nel passato (maxAge: 0)
    response.cookies.set("session_id", "", {
        httpOnly: true,
        path: '/',
        maxAge: 0 // Questo distrugge il cookie istantaneamente
    });

    return response;
}