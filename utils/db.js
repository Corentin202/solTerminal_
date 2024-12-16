import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function initDB() {
  try {
    // Test de connexion
    const connection = await pool.getConnection();
    console.log("Connexion à la base de données réussie !");
    await connection.release();
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données :", error.message);
    throw error; // Relancer l'erreur pour arrêter le processus si nécessaire
  }
}


export default pool;
export { initDB };
