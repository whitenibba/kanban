import { cookies } from 'next/headers';

/**
 * Verifica se l'utente ha accesso al progetto verificando il cookie di autenticazione
 * @param {number} id_project - L'ID del progetto da verificare
 * @returns {Promise<boolean>} true se autenticato, false altrimenti
 */
export async function verifyProjectAccess(id_project) {
  try {
    const cookieName = `operator_auth_${id_project}`;
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(cookieName);

    if (!authCookie) {
      return false;
    }

    // Verifica che il token sia valido (decodificabile)
    try {
      const tokenData = JSON.parse(
        Buffer.from(authCookie.value, 'base64').toString('utf-8')
      );
      // Verifica che il token contenga l'id_project corretto
      return tokenData.id_project === Number(id_project);
    } catch {
      return false;
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
}
