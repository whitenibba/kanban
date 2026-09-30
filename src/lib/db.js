import mysql from 'mysql2/promise';
/*
// Configurazione del pool di connessioni
// Questo approccio è migliore di creare una connessione singola per ogni richiesta
console.log("Tentativo di connessione con:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password_presente: !!process.env.DB_PASSWORD // Ti dirà true o false
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Aggiusta in base al traffico previsto
  queueLimit: 0
});

export default pool;*/


// Test diretto senza passare dal file .env
const pool = mysql.createPool({
  host: '127.0.0.1',  // Usa l'IP, non localhost
  user: 'root',
  password: 'Password123', // SCRIVILA A MANO QUI
  database: 'kanban_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;