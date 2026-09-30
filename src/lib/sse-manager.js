/**
 * sse-manager.js
 * Gestore centralizzato per le connessioni Server-Sent Events.
 */

// Usiamo global per mantenere i client attivi anche durante il Fast Refresh di Next.js
if (!global.sseClients) {
  global.sseClients = new Map();
}

const sseClients = global.sseClients;

/**
 * Registra un nuovo client per un progetto specifico.
 * @param {string} projectId - ID del progetto
 * @param {ReadableStreamDefaultController} controller - Controller dello stream Next.js
 * @param {string} clientId - ID unico del client (generato con randomUUID)
 */
export function addSSEClient(projectId, controller, clientId) {
  if (!sseClients.has(projectId)) {
    sseClients.set(projectId, []);
  }
  
  sseClients.get(projectId).push({ controller, clientId });
  console.log(`[SSE] Client ${clientId} connesso al progetto ${projectId}`);
}

/**
 * Rimuove un client quando la connessione viene chiusa.
 */
export function removeSSEClient(projectId, clientId) {
  if (sseClients.has(projectId)) {
    const clients = sseClients.get(projectId);
    const filtered = clients.filter((c) => c.clientId !== clientId);
    
    if (filtered.length === 0) {
      sseClients.delete(projectId);
    } else {
      sseClients.set(projectId, filtered);
    }
    console.log(`[SSE] Client ${clientId} rimosso dal progetto ${projectId}`);
  }
}

/**
 * Invia un messaggio a tutti i client connessi a un determinato progetto.
 */
export function broadcastSSEEvent(projectId, eventType, payload) {
  const clients = sseClients.get(projectId);
  if (!clients || clients.length === 0) return;

  const encoder = new TextEncoder();
  // Formato standard SSE: deve iniziare con "data: " e finire con due "\n"
  const message = `data: ${JSON.stringify({ type: eventType, payload })}\n\n`;
  const encodedMessage = encoder.encode(message);

  console.log(`[SSE] Invio evento ${eventType} a ${clients.length} client nel progetto ${projectId}`);

  clients.forEach((client) => {
    try {
      // Enqueue invia i dati attraverso lo stream aperto
      client.controller.enqueue(encodedMessage);
    } catch (err) {
      // Se l'invio fallisce, il client probabilmente si è disconnesso
      console.error(`[SSE] Errore invio a ${client.clientId}, rimozione in corso...`);
      removeSSEClient(projectId, client.clientId);
    }
  });
}