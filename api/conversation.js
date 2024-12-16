import { converseWithAI } from '../utils/openaiAssistant.js';
import pool from '../utils/sqlConnection.js';
import allowCors from '../utils/cors.js';
import queries from '../utils/queries.js';

// Gérer les conversations avec l'IA
async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { message, senderPublicKey } = req.body;

  if (!senderPublicKey) {
      return res.status(400).json({ success: false, error: 'Missing public key or transaction ID' });
  }

  try {
      const [user] = await pool.query(queries.checkUserPayment, [senderPublicKey]);

      if (user.length === 0) {
          return res.status(403).json({ success: false, error: 'Unauthorized user' });
      }

      const userId = user[0].id_user;

      // Appeler la logique de conversation de l'IA
      const aiResponse = await converseWithAI(message);

      // Enlever le isPaid de l'utilisateur
      await pool.query(queries.updateUserPaymentStatus, [userId]);

      // Enregistrement du message
      const connection = await pool.getConnection();

      try {
          const timestamp = new Date();
          const [result] = await connection.query(
              queries.insertMessage,
              [message, timestamp, aiResponse, userId]
          );

          // Incrémenter le nombre de messages
          await connection.query(queries.incrementMessageCount, [userId]);

      } finally {
          connection.release();
      }

      res.json({
          success: true,
          message: aiResponse,
      });
  } catch (error) {
      logger.error(`Erreur dans la conversation ou paiement: ${error.stack}`);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

export default allowCors(handler);
