import { NextResponse } from 'next/server';
import { addSSEClient, removeSSEClient } from '@/lib/sse-manager';
import { verifyProjectAccess } from '@/lib/auth-check';

export async function GET(request, { params }) {
  // 1. Recupero ID progetto (Asincrono per Next.js 15)
  const { id } = await params;

  // 2. Verifica Sicurezza: se non ha il cookie di accesso, rifiuta la connessione
  const hasAccess = await verifyProjectAccess(id);
  if (!hasAccess) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 3. Generazione ID unico per questa specifica scheda del browser
  const clientId = crypto.randomUUID();

  // 4. Creazione dello Stream SSE
  const stream = new ReadableStream({
    start(controller) {
      // Registriamo il controller nel nostro manager globale
      addSSEClient(id, controller, clientId);

      // Inviamo un messaggio di "benvenuto" per confermare la connessione
      const encoder = new TextEncoder();
      const welcomeMsg = `data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`;
      controller.enqueue(encoder.encode(welcomeMsg));

      // Opzionale: Heartbeat ogni 30 secondi per tenere viva la connessione (fondamentale su alcuni server)
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch (err) {
          clearInterval(keepAlive);
        }
      }, 30000);
    },
    cancel() {
      // Se l'utente chiude la scheda o ricarica, rimuoviamo il client
      removeSSEClient(id, clientId);
      console.log(`[SSE] Connessione chiusa per client: ${clientId}`);
    },
  });

  // 5. Risposta con header specifici per SSE
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none',
    },
  });
}